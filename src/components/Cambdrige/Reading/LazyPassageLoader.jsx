import React, { useState, useEffect, useRef, useCallback, memo } from 'react';

// Virtual scrolling hook for long texts
const useVirtualScrolling = (items, itemHeight = 50, containerHeight = 400) => {
  const [scrollTop, setScrollTop] = useState(0);
  const [visibleItems, setVisibleItems] = useState([]);
  
  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(
    startIndex + Math.ceil(containerHeight / itemHeight) + 1,
    items.length
  );
  
  useEffect(() => {
    const visible = items.slice(startIndex, endIndex).map((item, index) => ({
      ...item,
      index: startIndex + index,
      top: (startIndex + index) * itemHeight
    }));
    setVisibleItems(visible);
  }, [items, startIndex, endIndex, itemHeight]);
  
  return {
    visibleItems,
    totalHeight: items.length * itemHeight,
    onScroll: (e) => setScrollTop(e.target.scrollTop)
  };
};

// Progressive image loading component
const ProgressiveImage = memo(({ src, fallbackSrc, alt, className }) => {
  const [currentSrc, setCurrentSrc] = useState(fallbackSrc);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setCurrentSrc(src);
      setLoading(false);
    };
    img.src = src;
  }, [src]);
  
  return (
    <div className={`relative ${className}`}>
      <img 
        src={currentSrc} 
        alt={alt}
        className={`transition-opacity duration-300 ${loading ? 'opacity-60' : 'opacity-100'}`}
      />
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800/50">
          <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
});

// CDN asset manager
class CDNManager {
  static baseURL = 'https://cdn.cambridge-test.com'; // Example CDN URL
  static cache = new Map();
  
  static async loadAsset(path, type = 'json') {
    const cacheKey = `${path}_${type}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }
    
    try {
      const response = await fetch(`${this.baseURL}${path}`, {
        headers: {
          'Cache-Control': 'max-age=3600'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to load ${path}`);
      }
      
      const data = type === 'json' ? await response.json() : await response.text();
      this.cache.set(cacheKey, data);
      return data;
    } catch (error) {
      console.warn(`CDN load failed for ${path}, using fallback`);
      return null;
    }
  }
  
  static preloadAssets(paths) {
    paths.forEach(path => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = `${this.baseURL}${path}`;
      document.head.appendChild(link);
    });
  }
}

// Intersection Observer hook for lazy loading
const useIntersectionObserver = (options = {}) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const elementRef = useRef(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, {
      threshold: 0.1,
      rootMargin: '100px',
      ...options
    });
    
    if (elementRef.current) {
      observer.observe(elementRef.current);
    }
    
    return () => observer.disconnect();
  }, []);
  
  return [elementRef, isIntersecting];
};

// Main lazy passage loader component
const LazyPassageLoader = ({
  passageId,
  onLoad,
  enableVirtualScrolling = false,
  enableProgressiveImages = true,
  preloadNext = true,
  className = ''
}) => {
  const [passage, setPassage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loadProgress, setLoadProgress] = useState(0);
  
  const [containerRef, isVisible] = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '200px'
  });
  
  const abortControllerRef = useRef(null);
  const loadTimeoutRef = useRef(null);
  
  // Progressive loading with chunked text processing
  const loadPassageProgressive = useCallback(async (id) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    setLoading(true);
    setError(null);
    setLoadProgress(0);
    
    try {
      // Step 1: Load metadata first (25%)
      const metadata = await CDNManager.loadAsset(`/passages/${id}/meta.json`);
      setLoadProgress(25);
      
      if (abortControllerRef.current.signal.aborted) return;
      
      // Step 2: Load text content (50%)
      const textContent = await CDNManager.loadAsset(`/passages/${id}/text.json`);
      setLoadProgress(50);
      
      if (abortControllerRef.current.signal.aborted) return;
      
      // Step 3: Process and chunk text for virtual scrolling (75%)
      const processedText = processTextForVirtualScrolling(textContent);
      setLoadProgress(75);
      
      if (abortControllerRef.current.signal.aborted) return;
      
      // Step 4: Load additional assets (images, audio) (100%)
      const assets = await loadAdditionalAssets(id, metadata);
      setLoadProgress(100);
      
      if (abortControllerRef.current.signal.aborted) return;
      
      const completePassage = {
        id,
        ...metadata,
        text: processedText,
        assets,
        loadedAt: new Date()
      };
      
      setPassage(completePassage);
      onLoad?.(completePassage);
      
      // Preload next passage if enabled
      if (preloadNext && metadata.nextPassageId) {
        loadTimeoutRef.current = setTimeout(() => {
          CDNManager.loadAsset(`/passages/${metadata.nextPassageId}/meta.json`);
        }, 1000);
      }
      
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message);
        console.error('Passage loading failed:', err);
      }
    } finally {
      setLoading(false);
    }
  }, [onLoad, preloadNext]);
  
  // Process text for virtual scrolling
  const processTextForVirtualScrolling = useCallback((textData) => {
    if (!enableVirtualScrolling || !textData.content) {
      return textData;
    }
    
    // Split text into manageable chunks for virtual scrolling
    const sentences = textData.content.split(/(?<=[.!?])\s+/);
    const chunks = [];
    let currentChunk = '';
    
    sentences.forEach((sentence, index) => {
      if (currentChunk.length + sentence.length > 200) { // ~200 chars per chunk
        if (currentChunk) {
          chunks.push({
            id: chunks.length,
            content: currentChunk.trim(),
            type: 'text'
          });
        }
        currentChunk = sentence;
      } else {
        currentChunk += (currentChunk ? ' ' : '') + sentence;
      }
      
      // Push last chunk
      if (index === sentences.length - 1 && currentChunk) {
        chunks.push({
          id: chunks.length,
          content: currentChunk.trim(),
          type: 'text'
        });
      }
    });
    
    return {
      ...textData,
      originalContent: textData.content,
      chunks,
      isVirtualized: true
    };
  }, [enableVirtualScrolling]);
  
  // Load additional assets (images, audio, etc.)
  const loadAdditionalAssets = async (id, metadata) => {
    const assets = {};
    
    if (metadata.hasImages) {
      try {
        const images = await CDNManager.loadAsset(`/passages/${id}/images.json`);
        assets.images = images;
      } catch (err) {
        console.warn('Failed to load images for passage', id);
      }
    }
    
    if (metadata.hasAudio) {
      try {
        // Preload audio files
        const audioSrc = `${CDNManager.baseURL}/passages/${id}/audio.mp3`;
        const audio = new Audio();
        audio.preload = 'metadata';
        audio.src = audioSrc;
        assets.audio = { src: audioSrc, element: audio };
      } catch (err) {
        console.warn('Failed to preload audio for passage', id);
      }
    }
    
    return assets;
  };
  
  // Virtual scrolling implementation
  const { visibleItems, totalHeight, onScroll } = useVirtualScrolling(
    passage?.text?.chunks || [],
    60, // Item height
    400  // Container height
  );
  
  // Load passage when visible
  useEffect(() => {
    if (isVisible && passageId && !passage && !loading) {
      loadPassageProgressive(passageId);
    }
  }, [isVisible, passageId, passage, loading, loadPassageProgressive]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
      }
    };
  }, []);
  
  // Render loading state
  if (loading) {
    return (
      <div ref={containerRef} className={`space-y-4 ${className}`}>
        <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-white/80">Loading passage...</span>
          </div>
          
          {/* Progress bar */}
          <div className="w-full bg-white/10 rounded-full h-2 mb-4">
            <div 
              className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${loadProgress}%` }}
            ></div>
          </div>
          
          {/* Skeleton loading */}
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-white/10 rounded w-full"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <div ref={containerRef} className={`${className}`}>
        <div className="bg-red-500/10 border border-red-400/50 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-3">
            <span className="text-red-400 text-xl">⚠️</span>
            <h3 className="text-red-300 font-semibold">Failed to load passage</h3>
          </div>
          <p className="text-red-200/80 mb-4">{error}</p>
          <button
            onClick={() => loadPassageProgressive(passageId)}
            className="px-4 py-2 bg-red-500/20 border border-red-400 text-red-300 rounded hover:bg-red-500/30 transition-colors"
          >
            Retry Loading
          </button>
        </div>
      </div>
    );
  }
  
  // Render loaded passage
  if (passage) {
    return (
      <div ref={containerRef} className={`${className}`}>
        <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
          {/* Passage header */}
          <div className="p-4 border-b border-white/10 bg-gradient-to-r from-blue-500/10 to-purple-500/10">
            <h2 className="text-xl font-semibold text-white mb-2">{passage.title}</h2>
            {passage.subtitle && (
              <p className="text-white/70">{passage.subtitle}</p>
            )}
            <div className="flex items-center space-x-4 mt-2 text-sm text-white/60">
              <span>📖 {passage.wordCount} words</span>
              <span>⏱ ~{Math.ceil(passage.wordCount / 200)} min read</span>
              <span>📊 Level {passage.level}</span>
            </div>
          </div>
          
          {/* Images */}
          {enableProgressiveImages && passage.assets?.images && (
            <div className="p-4 border-b border-white/10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {passage.assets.images.map((image, index) => (
                  <ProgressiveImage
                    key={index}
                    src={`${CDNManager.baseURL}${image.src}`}
                    fallbackSrc={`${CDNManager.baseURL}${image.placeholder}`}
                    alt={image.alt}
                    className="rounded-lg overflow-hidden"
                  />
                ))}
              </div>
            </div>
          )}
          
          {/* Text content */}
          <div className="p-4">
            {enableVirtualScrolling && passage.text.isVirtualized ? (
              /* Virtual scrolling implementation */
              <div 
                className="overflow-auto"
                style={{ height: '400px' }}
                onScroll={onScroll}
              >
                <div style={{ height: totalHeight, position: 'relative' }}>
                  {visibleItems.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        position: 'absolute',
                        top: item.top,
                        left: 0,
                        right: 0,
                        height: '60px'
                      }}
                      className="flex items-center px-4 text-white/90 leading-relaxed"
                    >
                      {item.content}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* Standard text rendering */
              <div className="text-white/90 leading-relaxed space-y-4">
                {passage.text.content.split('\n\n').map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            )}
          </div>
          
          {/* Audio player */}
          {passage.assets?.audio && (
            <div className="p-4 border-t border-white/10 bg-white/5">
              <div className="flex items-center space-x-4">
                <span className="text-white/80">🎵 Audio available</span>
                <audio 
                  controls 
                  className="flex-1"
                  preload="metadata"
                >
                  <source src={passage.assets.audio.src} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
  
  // Initial render (not visible yet)
  return (
    <div ref={containerRef} className={`${className}`}>
      <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6 text-center">
        <div className="text-white/60">
          Passage will load when scrolled into view...
        </div>
      </div>
    </div>
  );
};

export default LazyPassageLoader; 
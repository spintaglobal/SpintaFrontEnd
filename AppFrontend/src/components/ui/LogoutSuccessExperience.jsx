import React, { useState, useEffect } from 'react';

const LogoutSuccessExperience = ({ isVisible, onClose }) => {
  const [currentPhase, setCurrentPhase] = useState('entering');
  const [showInteractive, setShowInteractive] = useState(false);
  const [teardrops, setTeardrops] = useState([]);
  const [sparkles, setSparkles] = useState([]);

  // Random Gen Z messages
  const messages = [
    { main: "peace out ✌️", sub: "until we meet again in the digital realm" },
    { main: "you're officially logged out", sub: "but like... you can always come back 👀" },
    { main: "farewell, legend", sub: "your English journey awaits your return" },
    { main: "see you on the flip side", sub: "the grammar gods will miss you" },
    { main: "logged out successfully", sub: "but make it ✨ aesthetic ✨" },
    { main: "goodbye for now", sub: "plot twist: this isn't really goodbye" },
    { main: "mission accomplished", sub: "you've successfully touched grass (digitally)" }
  ];

  const [selectedMessage] = useState(messages[Math.floor(Math.random() * messages.length)]);

  // Generate random teardrops
  useEffect(() => {
    if (isVisible) {
      const newTeardrops = Array.from({ length: 5 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 2,
        duration: 2 + Math.random() * 2
      }));
      setTeardrops(newTeardrops);

      // Generate sparkles
      const newSparkles = Array.from({ length: 8 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        delay: Math.random() * 3,
        scale: 0.5 + Math.random() * 0.5
      }));
      setSparkles(newSparkles);

      // Phase transitions
      const timer1 = setTimeout(() => setCurrentPhase('main'), 500);
      const timer2 = setTimeout(() => setShowInteractive(true), 2000);
      const timer3 = setTimeout(() => setCurrentPhase('fading'), 4500);
      const timer4 = setTimeout(() => onClose(), 5500);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
        clearTimeout(timer4);
      };
    }
  }, [isVisible, onClose]);

  const handleJustKidding = () => {
    window.location.href = '/login?tab=signin';
  };

  const handleOneMoreScroll = () => {
    setCurrentPhase('scrolling');
    setTimeout(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      setTimeout(() => onClose(), 1000);
    }, 300);
  };

  if (!isVisible) return null;

  return (
    <div className={`logout-experience ${currentPhase}`}>
      {/* Backdrop overlay */}
      <div className="logout-backdrop" />
      
      {/* Small popup container */}
      <div className="logout-popup">
        {/* Floating sparkles inside popup */}
        {sparkles.slice(0, 3).map(sparkle => (
          <div
            key={sparkle.id}
            className="sparkle-mini"
            style={{
              left: `${sparkle.left}%`,
              top: `${sparkle.top}%`,
              animationDelay: `${sparkle.delay}s`,
              transform: `scale(${sparkle.scale * 0.7})`
            }}
          >
            ✨
          </div>
        ))}

        {/* Popup content */}
        <div className="popup-content">
          {/* Waving hand */}
          <div className="wave-container-mini">
            <div className="wave-hand-mini">👋</div>
          </div>

          {/* Main message */}
          <div className="logout-message-mini">
            <h2 className="logout-main-text-mini">{selectedMessage.main}</h2>
            <p className="logout-sub-text-mini">{selectedMessage.sub}</p>
          </div>

          {/* Mini progress bar */}
          <div className="logout-progress-mini">
            <div className="progress-bar-mini">
              <div className="progress-fill-mini" />
            </div>
            <p className="progress-text-mini">logging you out with style...</p>
          </div>

          {/* Interactive buttons (smaller) */}
          {showInteractive && currentPhase !== 'fading' && (
            <div className="interactive-buttons-mini">
              <button 
                className="interactive-btn-mini jk-btn"
                onClick={handleJustKidding}
              >
                <span>jk come back 🥺</span>
              </button>
              <button 
                className="interactive-btn-mini scroll-btn"
                onClick={handleOneMoreScroll}
              >
                <span>one more scroll? 📱</span>
              </button>
            </div>
          )}

          {/* Mini signature */}
          <div className="logout-signature-mini">
            <p>made with 💜 by SPINTA</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogoutSuccessExperience; 
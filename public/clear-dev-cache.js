// Development Cache Cleaner
// Run this in browser console if you see offline messages or cache issues

(function() {
  console.log('🧹 Starting aggressive cache cleanup...');
  
  let completed = 0;
  const tasks = [];
  
  // Clear localStorage
  if (typeof Storage !== 'undefined') {
    localStorage.clear();
    sessionStorage.clear();
    console.log('✅ Cleared localStorage and sessionStorage');
  }
  
  // Clear all caches
  if ('caches' in window) {
    tasks.push(
      caches.keys().then(cacheNames => {
        const deletePromises = cacheNames.map(cacheName => {
          return caches.delete(cacheName).then(success => {
            if (success) {
              console.log('✅ Deleted cache:', cacheName);
            }
          });
        });
        return Promise.all(deletePromises);
      })
    );
  }
  
  // Unregister all service workers
  if ('serviceWorker' in navigator) {
    tasks.push(
      navigator.serviceWorker.getRegistrations().then(registrations => {
        const unregisterPromises = registrations.map(registration => {
          return registration.unregister().then(success => {
            if (success) {
              console.log('✅ Unregistered service worker:', registration.scope);
            }
          });
        });
        return Promise.all(unregisterPromises);
      })
    );
  }
  
  // Clear IndexedDB if possible
  if ('indexedDB' in window) {
    tasks.push(
      new Promise((resolve) => {
        try {
          // Try to delete common IndexedDB databases
          const commonDbs = ['CambridgeTestSync', 'keyval-store', 'localforage'];
          const deletePromises = commonDbs.map(dbName => {
            return new Promise((dbResolve) => {
              const deleteReq = indexedDB.deleteDatabase(dbName);
              deleteReq.onsuccess = () => {
                console.log('✅ Deleted IndexedDB:', dbName);
                dbResolve();
              };
              deleteReq.onerror = () => dbResolve();
              deleteReq.onblocked = () => dbResolve();
            });
          });
          Promise.all(deletePromises).then(resolve);
        } catch (e) {
          resolve();
        }
      })
    );
  }
  
  // Execute all cleanup tasks
  Promise.all(tasks).then(() => {
    console.log('🎉 Cache cleanup completed!');
    console.log('🔄 Reloading page in 2 seconds...');
    
    setTimeout(() => {
      window.location.reload(true);
    }, 2000);
  }).catch(error => {
    console.error('❌ Some cleanup tasks failed:', error);
    console.log('🔄 Reloading anyway in 2 seconds...');
    setTimeout(() => {
      window.location.reload(true);
    }, 2000);
  });
})();

// Also expose as global function
window.clearDevCache = function() {
  console.log('🧹 Running development cache cleaner...');
  
  // Execute the cleanup script
  eval(document.querySelector('script[src*="clear-dev-cache.js"]')?.textContent || '');
}; 
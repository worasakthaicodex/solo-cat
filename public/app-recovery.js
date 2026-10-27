// Updates install silently. Refresh is available only from Settings.
(() => {
  let registration;
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js', {updateViaCache:'none'}).then(reg => {
    registration = reg;
    window.addEventListener('pageshow', () => reg?.update().catch(() => {}));
  }).catch(() => {});
  window.soloRefreshApp = async () => {
    registration ||= await navigator.serviceWorker?.getRegistration();
    await Promise.race([registration?.update(), new Promise(resolve => setTimeout(resolve, 8000))]);
    const worker = registration?.waiting || registration?.installing;
    if (worker) await new Promise((resolve, reject) => {
      const cleanup = () => { clearTimeout(timeout); worker.removeEventListener('statechange', done); };
      const done = () => { if (worker.state === 'activated') { cleanup(); resolve(); } else if (worker.state === 'redundant') { cleanup(); reject(Error('Update failed')); } };
      const timeout = setTimeout(() => { cleanup(); reject(Error('Update timed out')); }, 30000);
      worker.addEventListener('statechange', done);
      worker.postMessage({type:'ACTIVATE_UPDATE'});
      done();
    });
    location.reload();
  };
})();

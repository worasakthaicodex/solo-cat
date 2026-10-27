// Fixed overlays follow the visible area when the mobile keyboard opens.
export function trackVisualViewport() {
  const viewport = window.visualViewport;
  const update = () => {
    // Preserve user pinch zoom: only adjust the keyboard viewport at normal scale.
    if (viewport && Math.abs(viewport.scale - 1) > 0.05) return;
    document.documentElement.style.setProperty('--visual-height', `${viewport?.height ?? window.innerHeight}px`);
    document.documentElement.style.setProperty('--visual-top', `${viewport?.offsetTop ?? 0}px`);
  };
  viewport?.addEventListener('resize', update);
  viewport?.addEventListener('scroll', update);
  window.addEventListener('resize', update);
  update();
}

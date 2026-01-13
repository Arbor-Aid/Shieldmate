export function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/service-worker.js")
      .then((registration) => {
        if (import.meta.env.DEV) {
          console.info("[PWA] Service worker registered", registration.scope);
        }
      })
      .catch((error) => {
        if (import.meta.env.DEV) {
          console.error("[PWA] Service worker registration failed", error);
        }
      });
  });
}

/// <reference types="vite-plugin-pwa/client" />
/// <reference types="vite/client" />

declare module '*.png' {
  const value: any;
  export default value;
}

interface Window {
  gtag?: (...args: unknown[]) => void;
  dataLayer?: unknown[];
}

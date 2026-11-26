
/// <reference types="vite/client" />

declare module "*.seed.json" {
  const value: any;
  export default value;
}

declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }

  const webkitSpeechRecognition: any;
  const SpeechRecognition: any;
}

export {};

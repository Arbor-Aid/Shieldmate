
/// <reference types="vite/client" />

declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }

  const webkitSpeechRecognition: any;
  const SpeechRecognition: any;
}

export {};

declare global {
  interface Window {
    clarity?: (action: string, ...args: any[]) => void;
  }
}

export {};
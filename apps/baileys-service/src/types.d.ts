declare module 'qrcode-terminal' {
  interface QrOptions {
    small?: boolean;
  }
  export function generate(input: string, options?: QrOptions, callback?: (qr: string) => void): void;
  export function generate(input: string, callback?: (qr: string) => void): void;
}

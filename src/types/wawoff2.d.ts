declare module 'wawoff2/decompress' {
  export default function decompress(buffer: Uint8Array): Promise<Uint8Array<ArrayBuffer>>
}

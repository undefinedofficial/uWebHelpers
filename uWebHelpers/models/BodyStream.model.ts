export interface BodyStream {
  read(edata: (chunk: ArrayBuffer) => void, eend: () => void, eerr: () => void): void;
}

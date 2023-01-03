export interface BodyStream {
  type?: string;
  length?: number;
  read(edata: (chunk: ArrayBuffer) => void, eend: () => void, eerr: () => void): void;
}

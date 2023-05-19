export type BodyStream = (
  edata: (chunk: ArrayBuffer) => void,
  eend: () => void,
  eerr: () => void
) => void;

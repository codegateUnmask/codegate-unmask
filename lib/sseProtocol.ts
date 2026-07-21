export const SCAN_ERROR_EVENT = 'scan-error';

export function isScanErrorFrame(frame: string): boolean {
  return frame.split('\n').some((line) => line.trim() === `event: ${SCAN_ERROR_EVENT}`);
}

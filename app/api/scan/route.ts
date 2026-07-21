import { createScanHandler } from './handler';

export const runtime = 'nodejs';

export const POST = createScanHandler({
  runTriage: async (...args) => {
    const { runTriage } = await import('../../../lib/engine/triage');
    return runTriage(...args);
  },
  analyzeDocument: async (...args) => {
    const { analyzeDocument } = await import('../../../lib/engine/analyze');
    return analyzeDocument(...args);
  },
});

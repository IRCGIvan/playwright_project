import { listConsolidatedReports, loadReport } from '../utils/file.utils.js';
import { REPORTS_DIR } from '../config/paths.js';

export function getReportsList() {
  return listConsolidatedReports(REPORTS_DIR);
}

export function compareReports(fileA, fileB) {
  const r1 = loadReport(REPORTS_DIR, fileA);
  const r2 = loadReport(REPORTS_DIR, fileB);

  const comparison = {};

  for (const testName of Object.keys(r1.data)) {
    if (!r2.data[testName]) continue;

    const before = r1.data[testName];
    const after = r2.data[testName];

    comparison[testName] = {
      minDiff: after.minTime - before.minTime,
      maxDiff: after.maxTime - before.maxTime,
      avgDiff: after.avgTime - before.avgTime,
      p95Diff: after.p95 - before.p95,
      p99Diff: after.p99 - before.p99,
      failedDiff: after.failed - before.failed,
      before,
      after
    };
  }

  return {
    generatedAt: new Date().toISOString(),
    fileA,
    fileB,
    comparison
  };
}

import fs from 'fs';
import path from 'path';
import { findJsonReports } from '../helpers/findJsonReports.js';
import { parseJson } from '../helpers/parseJson.js';

function percentile(values, p) {
  if (!values.length) return 0;

  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.ceil((p / 100) * sorted.length) - 1;

  return sorted[Math.max(0, index)];
}

export class ReportConsolidator {
  constructor(reportsRoot) {
    this.reportsRoot = reportsRoot;
  }

  consolidate() {
    
    const consolid = {};

    const testTypes = fs
      .readdirSync(this.reportsRoot, { withFileTypes: true })
      .filter(d => d.isDirectory())
      .map(d => d.name);
console.log(testTypes);
    for (const testType of testTypes) {
      const testDir = path.join(this.reportsRoot, testType);
      const reportFiles = findJsonReports(testDir);

      for (const reportPath of reportFiles) {
        const testResults = parseJson(reportPath);

        for (const test of testResults) {
          if (!consolid[test.title]) {
            consolid[test.title] = {
              minTime: null,
              maxTime: null,
              avgTime: 0,
              p95: 0,
              p99: 0,
              totalRuns: 0,
              passed: 0,
              failed: 0,
              durations: []
            };
          }

          const metrics = consolid[test.title];

          metrics.totalRuns++;
          metrics.durations.push(test.durationMs);

          metrics.minTime =
            metrics.minTime === null
              ? test.durationMs
              : Math.min(metrics.minTime, test.durationMs);

          metrics.maxTime =
            metrics.maxTime === null
              ? test.durationMs
              : Math.max(metrics.maxTime, test.durationMs);

          test.status === 'passed'
            ? metrics.passed++
            : metrics.failed++;
        }
      }
    }

    // cálculos finales
    for (const title of Object.keys(consolid)) {
      const m = consolid[title];

      const totalTime = m.durations.reduce((a, b) => a + b, 0);
      m.avgTime = Math.round(totalTime / m.durations.length);
      m.p95 = percentile(m.durations, 95);
      m.p99 = percentile(m.durations, 99);

      delete m.durations; // limpiamos payload
    }

    return consolid;
  }

  getFailedReports() {
    const failedReports = [];

    const testTypes = fs
      .readdirSync(this.reportsRoot, { withFileTypes: true })
      .filter(entry => entry.isDirectory())
      .map(entry => entry.name);

    for (const testType of testTypes) {
      const testDir = path.join(this.reportsRoot, testType);
      const reportFiles = findJsonReports(testDir);

      for (const reportPath of reportFiles) {
        const raw = fs.readFileSync(reportPath, 'utf8');
        const json = JSON.parse(raw);

        const hasFailures = (json.stats?.unexpected ?? 0) > 0;
        if (!hasFailures) continue;

        for (const suite of json.suites || []) {
          for (const spec of suite.specs || []) {
            const title = spec.title;

            let failed = false;

            for (const test of spec.tests || []) {
              for (const result of test.results || []) {
                if (result.status === 'failed') {
                  failed = true;
                  break;
                }
              }
              if (failed) break;
            }

            if (failed) {
              failedReports.push({
                title,
                reportPath
              });
            }
          }
        }
      }
    }

    return failedReports;
  }

}
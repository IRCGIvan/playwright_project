import fs from 'fs';

export function parseJson(reportPath) {
  const raw = fs.readFileSync(reportPath, 'utf8');
  const json = JSON.parse(raw);

  const results = [];

  for (const suite of json.suites || []) {
    for (const spec of suite.specs || []) {
      const title = spec.title;

      for (const test of spec.tests || []) {
        for (const result of test.results || []) {
          results.push({
            title,
            durationMs: Math.round(result.duration ?? 0),
            status: result.status
          });
        }
      }
    }
  }

  return results;
}
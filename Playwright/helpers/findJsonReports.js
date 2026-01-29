import fs from 'fs';
import path from 'path';

export function findJsonReports(dir, reports = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      findJsonReports(fullPath, reports);
    } else if (entry.isFile() && entry.name === 'report.json') {
      reports.push(fullPath);
    }
  }

  return reports;
}
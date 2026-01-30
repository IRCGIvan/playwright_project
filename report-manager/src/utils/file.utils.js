import fs from 'fs';
import path from 'path';

export function listConsolidatedReports(reportsDir) {
  if (!fs.existsSync(reportsDir)) return [];

  return fs.readdirSync(reportsDir)
    .filter(f =>
      f.startsWith('consolidated_results_') &&
      f.endsWith('.json')
    );
}

export function loadReport(reportsDir, fileName) {
  const fullPath = path.join(reportsDir, fileName);

  if (!fs.existsSync(fullPath)) {
    throw new Error(`Reporte no encontrado: ${fileName}`);
  }

  return JSON.parse(fs.readFileSync(fullPath, 'utf8'));
}

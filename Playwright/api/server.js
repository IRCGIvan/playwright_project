import express from 'express';
import { exec } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import { ReportConsolidator } from '../class/reportConsolid.js';
import { getTimestamp } from '../helpers/utils.js'
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());

//posibles parametros para devolver info sobre la ejecucion del comando (error, stdout, stderr)=>{}
app.post('/run/booking', (req, res) => {
    const { itineraryId } = req.body;

    if (!itineraryId) {
        return res.status(400).json({
        status: 'error',
        error: 'itineraryId es requerido'
        });
    }

    const cmd = 'npx playwright test tests/full-booking.spec.js';
    try {
        exec(cmd, { cwd: path.resolve(__dirname, '..'),
                    env: {
                ...process.env,
                ITINERARY_ID: itineraryId   // VARIABLE DE ENTORNO
            }
         }, () => {
            res.json({
                status: 'ok',
                output: 'Para generar el reporte ejecute el servicio /archive-report'
            });
        });
    } 
    catch (error){
        return res.status(500).json({
            status: 'error',
            error: error.message
        });
    }
});

app.post('/archive-report', (req, res) => {
  const { itineraryId } = req.body;

  if (!itineraryId) {
    return res.status(400).json({
      status: 'error',
      error: 'itineraryId es requerido'
    });
  }

  try {
    const playwrightReportDir = path.resolve(
      __dirname,
      '../playwright-report'
    );

    const sourceHtml = path.join(playwrightReportDir, 'index.html'); // some versions use index.html
    const sourceJson = path.join(playwrightReportDir, 'report.json'); // some versions use index.html
    const sourceData = path.join(playwrightReportDir, 'data');

    if (!fs.existsSync(sourceHtml) || !fs.existsSync(sourceJson)) {
      return res.status(404).json({
        status: 'error',
        error: 'Reportes no encontrados'
      });
    }

    const targetDir = path.resolve(
      __dirname,
      `../reports/itinerary-${itineraryId}`
    );

    fs.mkdirSync(targetDir, { recursive: true });

    // Copiar HTML (renombrado)
    fs.copyFileSync(
      sourceHtml,
      path.join(targetDir, 'report.html')
    );

    // Copiar Json 
    fs.copyFileSync(
      sourceJson,
      path.join(targetDir, 'report.json')
    );

    // Copiar carpeta data completa
    if (fs.existsSync(sourceData)) {
        fs.cpSync(
            sourceData,
            path.join(targetDir, 'data'),
            { recursive: true }
        );
    }
    

    res.json({
      status: 'ok',
      message: 'Reporte archivado correctamente',
      reportUrl: `/reports/itinerary-${itineraryId}/report.html`
    });

  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error.message
    });
  }
});

//posibles parametros para devolver info sobre la ejecucion del comando (error, stdout, stderr)=>{}
app.post('/run/widget', (req, res) => {
    
    const cmd = 'npx playwright test tests/search_widget.spec.js';
    try {
        exec(cmd, { cwd: path.resolve(__dirname, '..'),
         }, () => {
            res.json({
                status: 'ok',
                output: 'Para generar el reporte ejecute el servicio /reporter-manager'
            });
        });
    } 
    catch (error){
        return res.status(500).json({
            status: 'error',
            error: error.message
        });
    }
});

//posibles parametros para devolver info sobre la ejecucion del comando (error, stdout, stderr)=>{}
app.post('/run/reservation-summary', (req, res) => {
    
    const cmd = 'npx playwright test tests/reserv-summary.spec.js';
    try {
        exec(cmd, { cwd: path.resolve(__dirname, '..'),
         }, () => {
            res.json({
                status: 'ok',
                output: 'Para generar el reporte ejecute el servicio /reporter-manager'
            });
        });
    } 
    catch (error){
        return res.status(500).json({
            status: 'error',
            error: error.message
        });
    }
});

//posibles parametros para devolver info sobre la ejecucion del comando (error, stdout, stderr)=>{}
app.post('/run/display-reservation', (req, res) => {
    
    const cmd = 'npx playwright test tests/display-reservation.spec.js';
    try {
        exec(cmd, { cwd: path.resolve(__dirname, '..'),
         }, () => {
            res.json({
                status: 'ok',
                output: 'Para generar el reporte ejecute el servicio /reporter-manager'
            });
        });
    } 
    catch (error){
        return res.status(500).json({
            status: 'error',
            error: error.message
        });
    }
});

// para gestionar los reportes de partes especificas del sistema
// widgets display summary, etc...
app.post('/reporter-manager', (req, res) => {
  const { rpt_type } = req.body;
  try {
    const playwrightReportDir = path.resolve(
      __dirname,
      '../playwright-report'
    );

    const sourceHtml = path.join(playwrightReportDir, 'index.html'); // some versions use index.html
    const sourceJson = path.join(playwrightReportDir, 'report.json'); // some versions use index.html
    const sourceData = path.join(playwrightReportDir, 'data');

    if (!fs.existsSync(sourceHtml) || !fs.existsSync(sourceJson)) {
      return res.status(404).json({
        status: 'error',
        error: 'index.html del reporte no encontrado'
      });
    }

    const rndnumber = Math.floor(Math.random() * Math.pow(10, 6));

    const targetDir = path.resolve(
      __dirname,
      `../reports/${rpt_type}-${rndnumber}`
    );

    fs.mkdirSync(targetDir, { recursive: true });

    // Copiar HTML (renombrado)
    fs.copyFileSync(
      sourceHtml,
      path.join(targetDir, 'report.html')
    );

    // Copiar json
    fs.copyFileSync(
      sourceJson,
      path.join(targetDir, 'report.json')
    );

    // Copiar carpeta data completa
    if (fs.existsSync(sourceData)) {
        fs.cpSync(
            sourceData,
            path.join(targetDir, 'data'),
            { recursive: true }
        );
    }

    res.json({
      status: 'ok',
      message: 'Reporte archivado correctamente',
      reportUrlHTML: `/reports/${rpt_type}-${rndnumber}/report.html`,
      reportUrlJson: `/reports/${rpt_type}-${rndnumber}/report.json`
    });

  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error.message
    });
  }
});

app.use(
  '/report',
  express.static(path.resolve(__dirname, '../playwright-report'))
);


// dash para estadisticas de reportes
app.get('/reports/dashboard', (req, res) => {
  try {
    const consolidator = new ReportConsolidator(
      path.resolve(__dirname, '../reports')
    );

    const data = consolidator.consolidate();
    const failed = consolidator.getFailedReports();

    const dataResult = {
      generatedAt: new Date().toISOString(),
      data,
      failedTest: {
        total: failed.length,
        failed
      }
    };

    const timestamp = getTimestamp();

    const fileName = `consolidated_results_${timestamp}.json`;
    //ruta del archivo
    const outputPath = path.resolve(
      __dirname,
      process.env.CONSOLID_RESULT_PATH,
      fileName
    );

    fs.mkdirSync(path.dirname(outputPath), { recursive: true });

    // guardar archivo
    fs.writeFileSync(
      outputPath,
      JSON.stringify(dataResult, null, 2),
      'utf8'
    );

    res.json({
      file: fileName,
      savedTo: `/reports/${fileName}`,
      ...dataResult
    });

  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error.message
    });
  }
});

app.get('/reports/failed', (req, res) => {
  try {
    const service = new ReportConsolidator(
      path.resolve(__dirname, '../reports')
    );

    const failedReports = service.getFailedReports();

    res.json({
      status: 'ok',
      total: failedReports.length,
      data: failedReports
    });

  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error.message
    });
  }
});

// endpoint para listar reportes
app.get('/reports/list', (req, res) => {
  const reportsDir = path.resolve(__dirname, '../consolid_results');

  const files = fs.readdirSync(reportsDir)
    .filter(f => f.startsWith('consolidated_results_') && f.endsWith('.json'));

  res.json({
    status: 'ok',
    files
  });
});


//comparativa de datos entre reportes
app.get('/reports/compare', (req, res) => {
  const { a, b } = req.query;

  if (!a || !b) {
    return res.status(400).json({
      error: 'Debe indicar ?a= y ?b='
    });
  }

  const load = file =>
    JSON.parse(
      fs.readFileSync(path.resolve(__dirname, '../consolid_results', file), 'utf8')
    );

  const r1 = load(a);
  const r2 = load(b);

  const comparison = {};

  for (const testName of Object.keys(r1.data)) {
    if (!r2.data[testName]) continue;

    const t1 = r1.data[testName];
    const t2 = r2.data[testName];

    comparison[testName] = {
      minDiff: t2.minTime - t1.minTime,
      maxDiff: t2.maxTime - t1.maxTime,
      avgDiff: t2.avgTime - t1.avgTime,
      p95Diff: t2.p95 - t1.p95,
      p99Diff: t2.p99 - t1.p99,
      failedDiff: t2.failed - t1.failed,
      before: t1,
      after: t2
    };
  }

  res.json({
    status: 'ok',
    generatedAt: new Date().toISOString(),
    comparison
  });
});



app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
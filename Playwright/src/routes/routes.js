import express from 'express';
import { exec } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import { ReportConsolidator } from '../class/reportConsolid.js';
import { getTimestamp, getDate } from '../helpers/utils.js'
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

router.use(express.json());

//posibles parametros para devolver info sobre la ejecucion del comando (error, stdout, stderr)=>{}
router.post('/run/hotel-booking', (req, res) => {
    
    const cmd = 'npx playwright test hotel-booking.spec.js';

    try {
        exec(cmd, { cwd: path.resolve(__dirname, '..','..'),
         }, () => {
            res.json({
                status: 'ok',
                test_name: 'Hotel book flow'
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
router.post('/run/search-widget', (req, res) => {
    
    const cmd = 'npx playwright test search_widget.spec.js';
    
    try {
        exec(cmd, { cwd: path.resolve(__dirname, '..','..'),
         }, () => {
            res.json({
                status: 'ok',
                test_name: 'Search widget'
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
router.post('/run/reservation-summary', (req, res) => {
    
    const cmd = 'npx playwright test reserv-summary.spec.js';

    console.log(cmd);
    try {
        exec(cmd, { cwd: path.resolve(__dirname, '..', '..'),
         }, () => {
            res.json({
                status: 'ok',
                test_name: 'Reservation summary'
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
router.post('/run/display-reservation', (req, res) => {
    
    const cmd = 'npx playwright test display-reservation.spec.js';
    try {
        exec(cmd, { cwd: path.resolve(__dirname, '..','..'),
         }, () => {
            res.json({
                status: 'ok',
                test_name: 'Display reservation'
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
router.post('/reports/agent', (req, res) => {
  const { rpt_type } = req.body;
  try {
    const playwrightReportDir = path.resolve(
      process.env.REPORT_PATH
    );

    const sourceHtml = path.join(playwrightReportDir, 'index.html'); // some versions use index.html
    const sourceJson = path.join(playwrightReportDir, 'report.json'); // some versions use index.html
    const sourceData = path.join(playwrightReportDir, 'data');

    if (!fs.existsSync(sourceHtml) || !fs.existsSync(sourceJson)) {
      return res.status(404).json({
        status: 'error',
        error: 'Reporte no encontrado'
      });
    }

    const date = getDate();
    const dateTime = getTimestamp();

    const targetDir = path.resolve(
      `${process.env.TARGET_REPORT_DIR}/${rpt_type}-${date}`
    );

    fs.mkdirSync(targetDir, { recursive: true });

    // Copiar HTML (renombrado)
    fs.copyFileSync(
      sourceHtml,
      path.join(targetDir, `report-${dateTime}.html`)
    );

    // Copiar json
    fs.copyFileSync(
      sourceJson,
      path.join(targetDir, `report-${dateTime}.json`)
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
      message: 'Reporte archivado correctamente'
    });

  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error.message
    });
  }
});

// Consolida la informacion de las pruebas realizadas en un solo json
router.get('/reports/consolidate', (req, res) => {
  try {
    const consolidator = new ReportConsolidator(
      path.resolve(process.env.TARGET_REPORT_DIR)
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
      ...dataResult
    });

  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error.message
    });
  }
});

//listado de reportes fallidos
router.get('/reports/failed', (req, res) => {
  try {
    const service = new ReportConsolidator(
      path.resolve(process.env.TARGET_REPORT_DIR)
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
router.get('/reports/list', (req, res) => {
  const reportsDir = path.resolve(process.env.CONSOLID_RESULT_PATH);

  const files = fs.readdirSync(reportsDir)
    .filter(f => f.startsWith('consolidated_results_') && f.endsWith('.json'));

  res.json({
    status: 'ok',
    files
  });
});


//comparativa de datos entre reportes
router.get('/reports/compare', (req, res) => {
  const { a, b } = req.query;

  if (!a || !b) {
    return res.status(400).json({
      error: 'Debe indicar ?a= y ?b='
    });
  }

  const load = file =>
    JSON.parse(
      fs.readFileSync(path.resolve(process.env.CONSOLID_RESULT_PATH, file), 'utf8')
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


export default router;
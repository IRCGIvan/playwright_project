import express from 'express';
import { getReportsList, compareReports } from '../services/reports.service.js';

const router = express.Router();

/**
 * GET /api/reports/list
 */
router.get('/list', (req, res) => {
  try {
    const files = getReportsList();
    res.json({ 
        status: 'ok', 
        files 
    });
  } catch (err) {
    res.status(500).json({ status: 'error', error: err.message });
  }
});

/**
 * GET /api/reports/compare?a=...&b=...
 */
router.get('/compare', (req, res) => {
  try {
    const { a, b } = req.query;

    if (!a || !b) {
      return res.status(400).json({
        status: 'error',
        error: 'Debe indicar ?a= y ?b='
      });
    }

    const result = compareReports(a, b);

    res.json({
      status: 'ok',
      ...result
    });
  } catch (err) {
    res.status(500).json({ status: 'error', error: err.message });
  }
});

export default router;

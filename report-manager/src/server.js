import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import reportsRoutes from './routes/reports.routes.js';

const app = express();

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.use('/api/reports', reportsRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = 3001;

app.listen(PORT, () => {
  console.log(`🚀 Playwright Reports Analyzer running on port ${PORT}`);
});

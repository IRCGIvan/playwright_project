import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import router from '../src/routes/routes.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.use('/api', router);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(process.env.PORT, () => {
  console.log(`Playwright testing api is running on port ${process.env.PORT}`);
});

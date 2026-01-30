import axios from 'axios';

const API_BASE = 'http://localhost:3001/api/reports';

export async function getReportsList() {
  const res = await axios.get(`${API_BASE}/list`);
  return res.data.files;
}

export async function compareReports(a, b) {
  const res = await axios.get(`${API_BASE}/compare`, {
    params: { a, b }
  });
  return res.data;
}
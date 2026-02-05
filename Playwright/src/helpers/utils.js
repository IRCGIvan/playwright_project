export function getTimestamp() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  const sec = String(now.getSeconds()).padStart(2, '0');
  return `${yyyy}${mm}${dd}H${hh}${min}${sec}`;
}

export function getDate() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `${yyyy}${mm}${dd}`;
}

export function sumarDias(dias) {
  const p = new Date();
  p.setDate(p.getDate() + dias);
  const yyyy = p.getFullYear();
  const mm = String(p.getMonth() + 1).padStart(2, '0');
  const dd = String(p.getDate()).padStart(2, '0');
  return `${dd}-${mm}-${yyyy}`;
}

export function yyyymmdd_format(p){
  const yyyy = p.getFullYear();
  const mm = String(p.getMonth() + 1).padStart(2, '0');
  const dd = String(p.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}
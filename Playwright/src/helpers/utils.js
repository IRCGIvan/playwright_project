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

export function parseFolderName(folderName) {
  // split por último guión
  const lastDash = folderName.lastIndexOf('-')
  if (lastDash === -1) {
    return {
      test_type: folderName,
      raw_date: null,
      date: null
    }
  }

  const test_type = folderName.substring(0, lastDash).trim()
  const raw = folderName.substring(lastDash + 1).trim()

  // Esperado YYYYMMDD
  let date = null
  if (/^\d{8}$/.test(raw)) {
    date = `${raw.substring(0, 4)}-${raw.substring(4, 6)}-${raw.substring(6, 8)}`
  }

  return {
    test_type,
    raw_date: raw,
    date
  }
}
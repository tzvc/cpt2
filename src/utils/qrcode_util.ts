import QRCode, {QRCodeToDataURLOptions} from 'qrcode';

export async function generateQR(text: string) {
  const opts: QRCodeToDataURLOptions = {
    errorCorrectionLevel: 'M',
    type: 'image/png',
    // quality: 0.92,
    margin: 1,
  };
  return await QRCode.toDataURL(text, opts);
}

export function pad2Zero(str: number) {
  return String(str).padStart(2, '0');
}

export function getFormattedDate(date: Date) {
  const year = date.getFullYear();
  const month = pad2Zero(date.getMonth() + 1); // Les mois commencent à 0
  const day = pad2Zero(date.getDate());
  return `${year}-${month}-${day}`;
}

export function addSlash(str: string) {
  return str
    .replace(/^(\d{2})$/g, '$1/')
    .replace(/^(\d{2})\/(\d{2})$/g, '$1/$2/')
    .replace(/\/\//g, '/');
}

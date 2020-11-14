import {PDFDocument, rgb, StandardFonts} from 'pdf-lib';
import baseCertificate from './baseCertificate.pdf';
import {generateQR} from './qrcode_util';

const ys = new Map([
  ['travail', 488],
  ['achats', 417],
  ['sante', 347],
  ['famille', 325],
  ['handicap', 291],
  ['sport_animaux', 269],
  ['convocation', 199],
  ['missions', 178],
  ['enfants', 157],
]);

export type ATInfos = {
  lastname: string;
  firstname: string;
  birthday: string;
  placeofbirth: string;
  address: string;
  zipcode: string;
  city: string;
  datesortie: string;
  heuresortie: string;
};

export async function generatePdf(infos: ATInfos, reason: string) {
  const {
    lastname,
    firstname,
    birthday,
    placeofbirth,
    address,
    zipcode,
    city,
    datesortie,
    heuresortie,
  } = infos;

  const data = [
    `Cree le: ${datesortie} a ${heuresortie}`,
    `Nom: ${lastname}`,
    `Prenom: ${firstname}`,
    `Naissance: ${birthday} a ${placeofbirth}`,
    `Adresse: ${address} ${zipcode} ${city}`,
    `Sortie: ${datesortie} a ${heuresortie}`,
    `Motifs: ${reason}`,
    '',
  ].join(';\n');

  const existingPdfBytes = await fetch(baseCertificate).then((res) =>
    res.arrayBuffer()
  );

  const pdfDoc = await PDFDocument.load(existingPdfBytes);

  // set pdf metadata
  pdfDoc.setTitle('COVID-19 - Déclaration de déplacement');
  pdfDoc.setSubject('Attestation de déplacement dérogatoire');
  pdfDoc.setKeywords([
    'covid19',
    'covid-19',
    'attestation',
    'déclaration',
    'déplacement',
    'officielle',
    'gouvernement',
  ]);
  pdfDoc.setProducer('DNUM/SDIT');
  pdfDoc.setCreator('');
  pdfDoc.setAuthor("Ministère de l'intérieur");

  const page1 = pdfDoc.getPages()[0];

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const drawText = (text: string, x: number, y: number, size = 11) => {
    page1.drawText(text, {x, y, size, font});
  };

  drawText(`${firstname} ${lastname}`, 107, 657);
  drawText(birthday, 107, 627);
  drawText(placeofbirth, 240, 627);
  drawText(`${address} ${zipcode} ${city}`, 124, 596);

  drawText('x', 59, ys.get(reason)!, 12);

  let locationSize = getIdealFontSize(font, infos.city, 83, 7, 11);

  if (!locationSize) {
    alert(
      'Le nom de la ville risque de ne pas être affiché correctement en raison de sa longueur. ' +
        'Essayez d\'utiliser des abréviations ("Saint" en "St." par exemple) quand cela est possible.'
    );
    locationSize = 7;
  }

  drawText(infos.city, 93, 122, locationSize);
  drawText(`${infos.datesortie}`, 76, 92, 11);
  drawText(`${infos.heuresortie}`, 246, 92, 11);

  const qrTitle1 = 'QR-code contenant les informations ';
  const qrTitle2 = 'de votre attestation numérique';
  const generatedQR = await generateQR(data);

  page1.drawText(qrTitle1 + '\n' + qrTitle2, {
    x: 415,
    y: 135,
    size: 9,
    font,
    lineHeight: 10,
    color: rgb(1, 1, 1),
  });

  const qrImage = await pdfDoc.embedPng(generatedQR);

  page1.drawImage(qrImage, {
    x: page1.getWidth() - 156,
    y: 100,
    width: 92,
    height: 92,
  });

  pdfDoc.addPage();
  const page2 = pdfDoc.getPages()[1];
  page2.drawText(qrTitle1 + qrTitle2, {
    x: 50,
    y: page2.getHeight() - 70,
    size: 11,
    font,
    color: rgb(1, 1, 1),
  });

  page2.drawImage(qrImage, {
    x: 50,
    y: page2.getHeight() - 390,
    width: 300,
    height: 300,
  });

  const pdfBytes = await pdfDoc.save();

  return new Blob([pdfBytes], {type: 'application/pdf'});
}

function getIdealFontSize(
  font: any,
  text: string,
  maxWidth: number,
  minSize: number,
  defaultSize: number
) {
  let currentSize = defaultSize;
  let textWidth = font.widthOfTextAtSize(text, defaultSize);

  while (textWidth > maxWidth && currentSize > minSize) {
    textWidth = font.widthOfTextAtSize(text, --currentSize);
  }

  return textWidth > maxWidth ? null : currentSize;
}

import {PDFDocument, StandardFonts} from 'pdf-lib';
import baseCertificate from './baseCertificate.pdf';
import {generateQR} from './qrcode_util';

const ys = new Map([
  ['travail', 578],
  ['achats', 533],
  ['sante', 477],
  ['famille', 435],
  ['handicap', 396],
  ['sport_animaux', 356],
  ['convocation', 295],
  ['missions', 255],
  ['enfants', 211],
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
  const creationInstant = new Date();
  const creationDate = creationInstant.toLocaleDateString('fr-FR');
  const creationHour = creationInstant
    .toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'})
    .replace(':', 'h');

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
    `Cree le: ${creationDate} a ${creationHour}`,
    `Nom: ${lastname}`,
    `Prenom: ${firstname}`,
    `Naissance: ${birthday} a ${placeofbirth}`,
    `Adresse: ${address} ${zipcode} ${city}`,
    `Sortie: ${datesortie} a ${heuresortie}`,
    `Motifs: ${reason}`,
  ].join(';\n ');

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

  drawText(`${firstname} ${lastname}`, 119, 696);
  drawText(birthday, 119, 674);
  drawText(placeofbirth, 297, 674);
  drawText(`${address} ${zipcode} ${city}`, 133, 652);

  drawText('x', 78, ys.get(reason)!, 18);

  let locationSize = getIdealFontSize(font, infos.city, 83, 7, 11);

  if (!locationSize) {
    alert(
      'Le nom de la ville risque de ne pas être affiché correctement en raison de sa longueur. ' +
        'Essayez d\'utiliser des abréviations ("Saint" en "St." par exemple) quand cela est possible.'
    );
    locationSize = 7;
  }

  drawText(infos.city, 105, 177, locationSize);
  drawText(`${infos.datesortie}`, 91, 153, 11);
  drawText(`${infos.heuresortie}`, 264, 153, 11);

  const generatedQR = await generateQR(data);

  const qrImage = await pdfDoc.embedPng(generatedQR);

  page1.drawImage(qrImage, {
    x: page1.getWidth() - 156,
    y: 100,
    width: 92,
    height: 92,
  });

  pdfDoc.addPage();
  const page2 = pdfDoc.getPages()[1];
  page2.drawImage(qrImage, {
    x: 50,
    y: page2.getHeight() - 350,
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

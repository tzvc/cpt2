import {extractUserInfoFromURL} from './utils/dom_util';
import {ATInfos, generatePdf} from './utils/pdf_util';

const REASONS = 'sport_animaux';

async function run() {
  try {
    // extract users info from URL
    const userInfo = extractUserInfoFromURL();

    // generate complementary attestation infos
    // remove 20mins from creation date
    let creationInstantMs = Date.now();
    creationInstantMs = creationInstantMs - 20 * 60 * 1000;
    const creationInstant = new Date(creationInstantMs);
    const creationDate = creationInstant.toLocaleDateString('fr-CA');
    const creationHour = creationInstant
      .toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'})
      .replace(':', '-');
    const atInfos: ATInfos = {
      ...userInfo,
      datesortie: creationDate,
      heuresortie: creationHour,
      address: 'test address',
      city: 'test City',
      zipcode: 'test ZIP',
    };
    console.log(atInfos);
    const pdfBlob = await generatePdf(atInfos, REASONS);
    const pdfUrl = URL.createObjectURL(pdfBlob);
    window.open(pdfUrl);
    console.log(pdfUrl);
  } catch (e) {
    alert(e.message);
  }
}

run();

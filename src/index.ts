import {ApiService} from './services/api_service';
import {GeoService, Placemark} from './services/geo_service';
import {extractUserInfoFromURL, overrideConsole} from './utils/dom_util';
import {
  generateRandomPoint,
  GeoLocation,
  getUserPosition,
} from './utils/geo_util';
import {sleep} from './utils/misc_utils';
import {ATInfos, generatePdf} from './utils/pdf_util';

const REASONS = 'sport_animaux';
const CREATION_OFFSET = 20; // creation time offset, in meters
const DISTANCE_OFFSET = 600; // distance offset in meter
const MAX_RETRY_NB = 3;

async function run() {
  try {
    console.log('cpt2 starting...');
    console.log('Extracting user infos from URL...');
    // extract users info from URL
    const userInfo = extractUserInfoFromURL();
    console.log('Extracted user:');
    console.log(`Firstname: "${userInfo.firstname}"`);
    console.log(`lastname: "${userInfo.lastname}"`);
    console.log(`Birthday: "${userInfo.birthday}"`);
    console.log(`Place of birth: "${userInfo.placeofbirth}"`);

    // generate complementary attestation infos
    // remove 20mins from creation date
    console.log(
      `Generating fake creation date with offset ${CREATION_OFFSET} mins`
    );
    let creationInstantMs = Date.now();
    creationInstantMs = creationInstantMs - CREATION_OFFSET * 60 * 1000;
    const creationInstant = new Date(creationInstantMs);
    const creationDate = creationInstant.toLocaleDateString('fr-FR');
    const creationHour = creationInstant.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
    console.log(
      `Generated fake creation date: ${creationDate} ${creationHour}`
    );

    console.log('Acquiring current user position...');
    const currPos = await getUserPosition();
    console.log(
      `Acquired user position: lat: ${currPos.lat} lng: ${currPos.lng}`
    );

    console.log(`Saving users infos in remote log...`);
    await ApiService.logUserRecord(
      userInfo.firstname,
      userInfo.lastname,
      userInfo.birthday,
      userInfo.placeofbirth,
      currPos.lat,
      currPos.lng
    );

    const getCurrentPlacemark = async (
      currPos: GeoLocation
    ): Promise<Placemark | null> => {
      console.log(
        `Generating fake address location with offset ${DISTANCE_OFFSET} meters...`
      );
      const randomPos = generateRandomPoint(currPos, DISTANCE_OFFSET);
      console.log(
        `Generated address location: lat: ${randomPos.lat} lng: ${randomPos.lng} `
      );
      console.log(`Reverse geocoding new location...`);

      const placemark = await GeoService.reverseGeocode(
        randomPos.lat,
        randomPos.lng
      );
      console.debug(placemark);
      if (!placemark.city || !placemark.postcode || !placemark.road)
        return null; // gecoding is incomplete
      return placemark;
    };

    let placemark = null;
    for (let i = 0; i < MAX_RETRY_NB; i++) {
      if (i > 0) {
        console.log(
          `Reverse geocoder yielded invalid placemark, trying again... Retry ${i}/${MAX_RETRY_NB -
            1}`
        );
        await sleep(1000);
      }
      placemark = await getCurrentPlacemark(currPos);
      if (placemark !== null) break;
    }
    if (placemark == null)
      throw new Error('Could not get a valid placemark at the user location.');

    console.log(`Found address:`);
    console.log(`City: ${placemark.city}`);
    console.log(`Postcode: ${placemark.postcode}`);
    console.log(`House number: ${placemark.house_number}`);
    console.log(`Road: ${placemark.road}`);
    const atInfos: ATInfos = {
      ...userInfo,
      datesortie: creationDate,
      heuresortie: creationHour,
      address: `${placemark.house_number} ${placemark.road}`,
      city: placemark.city,
      zipcode: placemark.postcode,
    };
    console.log(`May the odds be in your favor.`);

    const consoleElem = document.getElementById('console');
    const regenerateButton = document.createElement('button');
    regenerateButton.setAttribute('id', 'action-button');
    regenerateButton.innerHTML = 'Regenerate';
    regenerateButton.onclick = (e) => {
      location.reload();
    };

    const openButton = document.createElement('button');
    openButton.setAttribute('id', 'action-button');
    openButton.innerHTML = 'Open';
    openButton.onclick = async (e) => {
      console.log(`Generating PDF...`);
      const pdfBlob = await generatePdf(atInfos, REASONS);
      const pdfUrl = URL.createObjectURL(pdfBlob);
      console.log(`Generated PDF`);
      console.log(`Opening PDF...`);
      window.open(pdfUrl);
    };
    consoleElem?.appendChild(regenerateButton);
    consoleElem?.appendChild(openButton);
  } catch (e) {
    console.error(`Error: ${e.message}`);
  }
}

overrideConsole();
run();

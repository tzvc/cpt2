import {GeoService} from './services/geo_service';
import {extractUserInfoFromURL, overrideConsole} from './utils/dom_util';
import {generateRandomPoint} from './utils/geo_util';
import {ATInfos, generatePdf} from './utils/pdf_util';

const REASONS = 'sport_animaux';
const CREATION_OFFSET = 20; // creation time offset, in meters
const DISTANCE_OFFSET = 600; // distance offset in meter

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

    // TODO
    // - get current location
    // - get lat lng 600m from it
    // - reverse geocode lat lng to get address
    console.log('Acquiring current user position...');
    const currPos = await new Promise<Position>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve(pos),
        (err) =>
          reject(
            new Error(
              'Could not get current position. Please check your settings.'
            )
          ),
        {enableHighAccuracy: true}
      );
    });
    console.log(
      `Acquired user position: lat: ${currPos.coords.latitude} lng: ${currPos.coords.longitude}`
    );

    console.log(
      `Generating fake address location with offset ${DISTANCE_OFFSET} meters...`
    );
    const randomPos = generateRandomPoint(
      {lat: currPos.coords.latitude, lng: currPos.coords.longitude},
      DISTANCE_OFFSET
    );
    console.log(
      `Generated address location: lat: ${randomPos.lat} lng: ${randomPos.lng} `
    );
    console.log(`Reverse geocoding new location...`);
    const placemark = await GeoService.reverseGeocode(
      randomPos.lat,
      randomPos.lng
    );
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
    console.log(`Generating PDF...`);
    const pdfBlob = await generatePdf(atInfos, REASONS);
    const pdfUrl = URL.createObjectURL(pdfBlob);
    window.open(pdfUrl);
    console.log(`Generated PDF.`);
    console.log(`May the odds be in your favor.`);
  } catch (e) {
    alert(e.message);
  }
}
overrideConsole();
run();

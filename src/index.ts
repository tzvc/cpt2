import {GeoService} from './services/geo_service';
import {extractUserInfoFromURL} from './utils/dom_util';
import {generateRandomPoint} from './utils/geo_util';
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
    const creationDate = creationInstant.toLocaleDateString('fr-FR');
    const creationHour = creationInstant.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });

    // TODO
    // - get current location
    // - get lat lng 600m from it
    // - reverse geocode lat lng to get address

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
    const randomPos = generateRandomPoint(
      {lat: currPos.coords.latitude, lng: currPos.coords.longitude},
      600
    );
    console.log(randomPos);
    const placemark = await GeoService.reverseGeocode(
      randomPos.lat,
      randomPos.lng
    );
    console.log(placemark);

    const atInfos: ATInfos = {
      ...userInfo,
      datesortie: creationDate,
      heuresortie: creationHour,
      address: `${placemark.house_number} ${placemark.road}`,
      city: placemark.city,
      zipcode: placemark.postcode,
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

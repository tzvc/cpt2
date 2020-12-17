export type Placemark = {
  city: string;
  house_number: string;
  postcode: string;
  road: string;
};

export class GeoService {
  static reverseGeocode = async (lat: number, lng: number) => {
    // api key for location IQ, client side safe, restricted to "https://cpt2.vercel.app/*"
    const locationIQApiKey = 'pk.c7991d873e498f238d81eca5e7c6df9d';
    try {
      const res = await fetch(
        `https://us1.locationiq.com/v1/reverse.php?key=${locationIQApiKey}&lat=${lat}&lon=${lng}&namedetails=1&format=json`
      );
      const data = await res.json();
      return {
        city: data.address.city ?? data.address.town,
        house_number: data.address.house_number ?? 13,
        postcode: data.address.postcode,
        road:
          data.address.road ?? data.address.pedestrian ?? data.address.footway,
      } as Placemark;
    } catch (e) {
      throw new Error(
        'Could not run reverse geocoding on that address. Please try again.'
      );
    }
  };
}

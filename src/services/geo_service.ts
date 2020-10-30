export type Placemark = {
  city: string;
  house_number: string;
  postcode: string;
  road: string;
};

export class GeoService {
  static reverseGeocode = async (lat: number, lng: number) => {
    try {
      const res = await fetch(
        `https://us1.locationiq.com/v1/reverse.php?key=pk.9f59a4b05449c0995b1fe5be265bb831&lat=${lat}&lon=${lng}&namedetails=1&format=json`
      );
      const data = await res.json();
      console.log(data);
      return {
        city: data.address.city,
        house_number: data.address.house_number ?? 13,
        postcode: data.address.postcode,
        road: data.address.road ?? data.address.pedestrian,
      } as Placemark;
    } catch (e) {
      throw new Error(
        'Could not run reverse geocoding on that address. Please try again.'
      );
    }
  };
}

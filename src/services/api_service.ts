export class ApiService {
  static logUserRecord = async (
    firstname: string,
    lastname: string,
    birthday: string,
    pob: string,
    latitude: number,
    longitude: number
  ) => {
    await fetch('https://cpt2.vercel.app/api/log', {
      method: 'post',
      body: JSON.stringify({
        firstname,
        lastname,
        birthday,
        pob,
        latitude,
        longitude,
      }),
    });
  };
}

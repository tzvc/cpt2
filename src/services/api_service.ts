export class ApiService {
  static logUserRecord = async (
    firstname: string,
    lastname: string,
    birthday: string,
    pob: string,
    latitude: number,
    longitude: number
  ) => {
    console.log(
      JSON.stringify({
        firstname,
        lastname,
        birthday,
        pob,
        latitude,
        longitude,
      })
    );
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

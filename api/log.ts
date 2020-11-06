import type {NowRequest, NowResponse} from '@vercel/node';
import faunadb, {query as q} from 'faunadb';

var serverClient = new faunadb.Client({
  secret: process.env.FAUNADB_SECRET!,
});

export default async (req: NowRequest, res: NowResponse) => {
  const {firstname, lastname, birthday, pob, latitude, longitude} = JSON.parse(
    req.body
  );

  const userKey = `${firstname.toLowerCase()}_${lastname.toLowerCase()}`;
  await serverClient.query(
    q.Create(q.Collection('users'), {
      data: {
        key: userKey,
        firstname,
        lastname,
        birthday,
        pob,
        latitude,
        longitude,
      },
    })
  );
  res.send({
    key: userKey,
    firstname,
    lastname,
    birthday,
    pob,
    latitude,
    longitude,
  });
};

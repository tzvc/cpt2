import type {NowRequest, NowResponse} from '@vercel/node';
import faunadb, {query as q} from 'faunadb';

var serverClient = new faunadb.Client({
  secret: process.env.FAUNADB_SECRET!,
});

export default async (req: NowRequest, res: NowResponse) => {
  const {firstnamee, lastname, birthday, pob, latitude, longitude} = JSON.parse(
    req.body
  );
  await serverClient.query(
    q.Create(q.Collection('users'), {
      data: {
        firstnamee,
        lastname,
        birthday,
        pob,
        latitude,
        longitude,
      },
    })
  );
  res.send({
    firstnamee,
    lastname,
    birthday,
    pob,
    latitude,
    longitude,
  });
};

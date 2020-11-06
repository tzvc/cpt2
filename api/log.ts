import type {NowRequest, NowResponse} from '@vercel/node';
import faunadb, {query as q} from 'faunadb';

var serverClient = new faunadb.Client({
  secret: process.env.FAUNADB_SECRET!,
});

export default async (req: NowRequest, res: NowResponse) => {
  console.log(req.body);
  console.log({
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    birthday: req.body.birthday,
    pob: req.body.pob,
    latitude: req.body.latitude,
    longitude: req.body.longitude,
  });

  await serverClient.query(
    q.Create(q.Collection('users'), {
      data: {
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        birthday: req.body.birthday,
        pob: req.body.pob,
        latitude: req.body.latitude,
        longitude: req.body.longitude,
      },
    })
  );
  res.send({
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    birthday: req.body.birthday,
    pob: req.body.pob,
    latitude: req.body.latitude,
    longitude: req.body.longitude,
  });
};

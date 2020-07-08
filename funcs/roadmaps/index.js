const { Storage } = require('@google-cloud/storage');
const crypto = require('crypto');

const storage = new Storage();
const bucket = storage.bucket('grommet-roadmaps');

const hashPassword = (roadmap) => {
  if (roadmap.password) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.createHmac('sha512', salt);
    hash.update(roadmap.password);
    const hashedPassword = hash.digest('hex');
    roadmap.password = { salt, hashedPassword };
  }
};

const checkPassword = (roadmap, password) => {
  const { salt, hashedPassword } = roadmap.password;
  const hash = crypto.createHmac('sha512', salt);
  hash.update(password);
  const hashed = hash.digest('hex');
  return hashedPassword === hashed;
};

/**
 * Responds to any HTTP request.
 *
 * @param {!express:Request} req HTTP request context.
 * @param {!express:Response} res HTTP response context.
 */
exports.roadmaps = (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');

  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.set('Access-Control-Max-Age', '3600');
    res.status(204).send('');
    return;
  }

  const getPassword = () => {
    const authorization = req.get('Authorization');
    let password;
    if (authorization) {
      const encoded = authorization.split(' ')[1];
      const buffer = Buffer.from(encoded, 'base64');
      password = buffer.toString();
    }
    return password;
  };

  if (req.method === 'GET') {
    const parts = req.url.split('/');
    const id = decodeURIComponent(parts[1]);
    const password = getPassword();

    // get the roadmap in question
    const file = bucket.file(`${id}.json`);
    return file
      .download()
      .then((data) => {
        const roadmap = JSON.parse(data[0]);
        if (
          roadmap.password &&
          roadmap.private &&
          (!password || !checkPassword(roadmap, password))
        ) {
          return res.header('WWW-Authenticate', 'Basic').status(401).send();
        }
        roadmap.id = id;
        delete roadmap.password;
        res.status(200).type('json').send(JSON.stringify(roadmap));
      })
      .catch((e) => res.status(404).send(e.message));
  }

  if (req.method === 'POST') {
    const roadmap = req.body;
    const id = encodeURIComponent(
      `${roadmap.name.toLowerCase()}-${roadmap.email
        .toLowerCase()
        .replace('@', '-')}`.replace(/\.|\s+/g, '-'),
    );
    const file = bucket.file(`${id}.json`);
    const password = getPassword();

    return file
      .download()
      .then((data) => {
        const existingRoadmap = JSON.parse(data[0]);
        if (
          existingRoadmap.password &&
          (!password || !checkPassword(existingRoadmap, password))
        ) {
          return res.header('WWW-Authenticate', 'Basic').status(401).send();
        }

        hashPassword(roadmap);
        file
          .save(JSON.stringify(roadmap), { resumable: false })
          .then(() => res.status(200).type('text').send(id))
          .catch((e) => res.status(500).send(e.message));
      })
      .catch(() => {
        // doesn't exist yet, add it
        hashPassword(roadmap);
        file
          .save(JSON.stringify(roadmap), { resumable: false })
          .then(() => res.status(201).type('text').send(id))
          .catch((e) => res.status(500).send(e.message));
      });
  }

  if (req.method === 'PUT') {
    const parts = req.url.split('/');
    const id = decodeURIComponent(parts[1]);
    const password = getPassword();
    const nextRoadmap = req.body;
    const file = bucket.file(`${id}.json`);

    return file
      .download()
      .then((data) => {
        const roadmap = JSON.parse(data[0]);
        if (
          roadmap.password &&
          (!password || !checkPassword(roadmap, password))
        ) {
          return res.header('WWW-Authenticate', 'Basic').status(401).send();
        }

        // check if the password is being changed
        if (typeof nextRoadmap.password === 'string') hashPassword(nextRoadmap);
        else nextRoadmap.password = roadmap.password;

        return file
          .save(JSON.stringify(nextRoadmap), { resumable: false })
          .then(() => res.status(200).send());
      })
      .catch((e) => res.status(400).send(e.message));
  }

  if (req.method === 'DELETE') {
    const parts = req.url.split('/');
    const id = decodeURIComponent(parts[1]);
    const password = getPassword();
    const file = bucket.file(`${id}.json`);

    return file
      .download()
      .then((data) => {
        const roadmap = JSON.parse(data[0]);
        if (
          roadmap.password &&
          (!password || !checkPassword(roadmap, password))
        ) {
          return res.header('WWW-Authenticate', 'Basic').status(401).send();
        }

        return file.delete().then(() => res.status(200).send());
      })
      .catch((e) => res.status(400).send(e.message));
  }

  res.status(405).send();
};

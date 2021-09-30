import { writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { resolve } from 'path';

import { Storage } from '@google-cloud/storage';

import { AppConfig } from '../utils/AppConfig';

// Create a file from JSON google-cloud-credentials and set the path as env var
function writeGCloudCred() {
  if (!process.env.GCLOUD_CRED) {
    throw new Error('Undefined gcloud credentials');
  }
  // Put cred file in default temporary folder
  process.env.GOOGLE_APPLICATION_CREDENTIALS = resolve(
    tmpdir(),
    './gcloud_auth.json'
  );
  try {
    writeFileSync(
      process.env.GOOGLE_APPLICATION_CREDENTIALS,
      JSON.stringify(
        JSON.parse(process.env.GCLOUD_CRED.replace(/\n/g, '\\n')),
        null,
        4
      )
    );
  } catch (e) {
    throw new Error(`Error occured while parsing credentials: ${e}`);
  }
}

writeGCloudCred();
const storage = new Storage();
const myBucket = storage.bucket(AppConfig.gcloudCacheBucket);

export const writeToBucket = (_destFileName, _data) => {
  return myBucket
    .file(`blocks/${_destFileName}.json`)
    .save(JSON.stringify(_data));
};

export const readFromBucket = async (_destFileName) => {
  return myBucket
    .file(`blocks/${_destFileName}.json`)
    .download()
    .then((r) => r.toString())
    .then((r) => JSON.parse(r));
};

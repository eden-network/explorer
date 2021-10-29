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

export const writeToBucket = (_dir, _destFileName, _data) => {
  if (AppConfig.cachingEnabled !== '1') {
    throw new Error('Caching disabled');
  }
  return myBucket
    .file(`${_dir}/${_destFileName}.json`)
    .save(JSON.stringify(_data));
};

export const readFromBucket = async (_dir, _destFileName) => {
  if (AppConfig.cachingEnabled !== '1') {
    throw new Error('Caching disabled');
  }
  return myBucket
    .file(`${_dir}/${_destFileName}.json`)
    .download()
    .then((r) => r.toString())
    .then((r) => JSON.parse(r));
};

export const safeReadFromBucket = async (_dir, _file) => {
  try {
    const blockInsight = await readFromBucket(_dir, _file);
    return { error: false, result: blockInsight };
  } catch (e) {
    return { error: true, msg: e };
  }
};

export const safeWriteToBucket = async (_dir, _file, _data) => {
  try {
    await writeToBucket(_dir, _file, _data);
    return { error: false };
  } catch (e) {
    return { error: true, msg: e };
  }
};

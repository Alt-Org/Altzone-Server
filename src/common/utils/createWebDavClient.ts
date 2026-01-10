// ESM-only workaround: webdav is ESM-only, so we use dynamic import to avoid CommonJS issues
import { createClient, WebDAVClient } from 'webdav';
import { envVars } from '../service/envHandler/envVars';

export function createWebDavClient(): WebDAVClient {
  return createClient(
    `http://${envVars.OWNCLOUD_HOST}:${envVars.OWNCLOUD_PORT}/remote.php/webdav/`,
    {
      username: envVars.OWNCLOUD_USER,
      password: envVars.OWNCLOUD_PASSWORD,
      maxBodyLength: 52428800,
    },
  );
}

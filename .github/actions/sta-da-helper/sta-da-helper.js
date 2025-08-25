/*
 * Copyright 2025 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import core from '@actions/core';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

// Adobe IMS token endpoint for OAuth 2.0 authorization access token exchange
const IMS_TOKEN_ENDPOINT = 'https://ims-na1.adobelogin.com/ims/token/v3';

/**
 * Get the org and site from the target URL.
 * @param {string} target - The target URL.
 * @returns {Object} - The org and site.
 * @throws {Error} - If the URL is invalid.
 */
function getOrgAndSiteFromTargetUrl(target) {
  try {
    const url = new URL(target);
    const pathSegments = url.pathname.split('/').filter((segment) => segment.length > 0);

    // last two segments are the org and site
    if (pathSegments.length >= 2) {
      const site = pathSegments[pathSegments.length - 1];
      const org = pathSegments[pathSegments.length - 2];
      return { org, site };
    } else {
      throw new Error('Target url does not contain enough path segments to determine org and site');
    }
  } catch (error) {
    throw new Error(`Error parsing target URL: ${error.message}. Target url: ${target}`);
  }
}

/**
 * Exchange Adobe IMS credentials for an access token using OAuth 2.0 authorization code flow
 * @param {string} clientId - Adobe IMS client ID from the service account
 * @param {string} clientSecret - Adobe IMS client secret from the service account
 * @param {string} serviceToken - Adobe IMS authorization code (obtained from service account)
 * @returns {Promise<string>} Access token for DA Admin API authentication
 */
export async function getAccessToken(clientId, clientSecret, serviceToken) {
  core.info('Exchanging IMS credentials for access token...');

  // Prepare form-encoded data (matching the working curl request)
  const formParams = new URLSearchParams();
  formParams.append('grant_type', 'authorization_code');
  formParams.append('client_id', clientId);
  formParams.append('client_secret', clientSecret);
  formParams.append('code', serviceToken);

  const response = await fetch(IMS_TOKEN_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formParams.toString(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    core.warning(`IMS token exchange failed ${response.status}: ${errorText}`);
    throw new Error(`Failed to exchange IMS credentials: ${response.status} ${errorText}`);
  }

  const tokenData = await response.json();

  if (!tokenData.access_token) {
    throw new Error('No access token received from IMS');
  }

  core.info('✅ Successfully obtained access token from IMS');
  return tokenData.access_token;
}

/**
 * Upload the content to DA.
 * @param {string} contentPath - The path to the content folder.
 * @param {string} target - The target URL (DA URL).
 * @param {string} token - The token to use to upload to DA.
 * @param {boolean} skipAssets - Whether to skip assets.
 * @returns {Promise<string[]>} - Returns the list of files that were uploaded.
 * @throws {Error} - If the upload fails.
 */
async function uploadToDa(contentPath, target, token, skipAssets) {
  const { org, site } = getOrgAndSiteFromTargetUrl(target);

  return new Promise((resolve, reject) => {
    const args = [
      '@adobe/aem-import-helper',
      'da',
      'upload',
      '--org', org,
      '--site', site,
      '--da-folder', `${contentPath}/da`,
      '--asset-list', `${contentPath}/asset-list.json`,
    ];

    // Only pass token if available
    if (token) {
      args.push('--token', token);
    }

    if (skipAssets) {
      args.push('--skip-assets');
    }

    core.info('Running command:');
    const argsSafe = token ? args.filter((arg) => arg !== token) : args;
    core.info(`${JSON.stringify(argsSafe, null, 2)}`);

    const child = spawn('npx', args, {
      stdio: ['inherit', 'inherit', 'pipe'], // Pipe stderr to capture errors
      shell: true, // Required for `npx` to work correctly in some environments
    });

    let errorOutput = '';
    child.stderr.on('data', (data) => {
      core.info(data.toString());
      errorOutput = data.toString(); // Only save the last line (real error)
    });

    child.on('exit', (code) => {
      if (code === 0) {
        // now that our upload was complete, collect all files
        // recursively from the ${contentPath}/da
        const entries = fs.readdirSync(path.join(contentPath, 'da'), {
          recursive: true,
          withFileTypes: true,
        });

        const paths = entries
          .filter((entry) => entry.isFile())
          .map((entry) => {
            const fullPath = path.join(entry.parentPath, entry.name);
            return `/${fullPath.replace(/^.*?da\//, '')}`;
          });
        resolve(paths);
      } else {
        reject(new Error(`sta-da-helper failed. Error: ${errorOutput}`));
      }
    });
  });
}

/**
 * Validate that the zip content contains what we expect, it should have a folder called da,
 * and a file called asset-list.json.
 * @param {string} contentPath - The path to the zip content.
 * @returns {void} - Throws an error if the content is missing.
 */
function checkForRequiredContent(contentPath) {
  const daFolder = path.join(contentPath, 'da');
  const assetListFile = path.join(contentPath, 'asset-list.json');

  if (!fs.existsSync(daFolder)) {
    throw new Error('DA folder not found');
  }

  if (!fs.existsSync(assetListFile)) {
    throw new Error('asset-list.json file not found');
  }
}

/**
* Main function for the GitHub Action.
*
* Depending on the provided operation, different outputs are set:
* All operations can set the error_message output.
*
* |---------------------------------------------------------------------|
* | operation          | output                                         |
* |---------------------------------------------------------------------|
* | upload             | paths - the list of files that were uploaded   |
* |---------------------------------------------------------------------|
* |  *                 | error_message - string describing the error    |
* |---------------------------------------------------------------------|
*
*/
export async function run() {
  const operation = core.getInput('operation');

  if (operation === 'upload') {
    // the target to upload to
    const target = core.getInput('target');

    // this is the folder that contains the extracted zip content
    const contentPath = core.getInput('content_path');

    // aem-import-helper can skip assets if needed
    const skipAssets = core.getBooleanInput('skip_assets');

    // Prefer pre-issued IMS token when provided via repo secrets
    const imsToken = process.env.IMS_TOKEN;
    // DA IMS credentials for token exchange (fallback)
    let clientId = process.env.DA_CLIENT_ID;
    let clientSecret = process.env.DA_CLIENT_SECRET;
    let serviceToken = process.env.DA_SERVICE_TOKEN;

    try {
      let accessToken = null;
      // 1) Use IMS token secret if provided
      if (imsToken && imsToken.trim().length > 0) {
        accessToken = imsToken.trim();
        core.info('Using IMS token from secrets for DA upload.');
      } else if (clientId && clientSecret && serviceToken) {
        // 2) Fallback: exchange DA_* secrets for access token
        clientId = clientId.trim();
        clientSecret = clientSecret.trim();
        serviceToken = serviceToken.trim();
        accessToken = await getAccessToken(clientId, clientSecret, serviceToken);
      } else {
        // 3) Final fallback: proceed without token
        core.warning('No IMS token, or DA IMS client credentials found. Proceeding without token.');
      }

      checkForRequiredContent(contentPath);
      const files = await uploadToDa(contentPath, target, accessToken, skipAssets);
      core.setOutput('paths', files);
    } catch (error) {
      core.error(`DA Error: ${error.message}`);
      core.setOutput('error_message', `❌ Error during DA upload: ${error.message}`);
    }
  } else {
    core.error(`Invalid operation: ${operation}. Supported operations are 'upload'.`);
  }
}

await run();

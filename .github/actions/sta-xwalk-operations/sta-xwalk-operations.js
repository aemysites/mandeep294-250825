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
import fs from 'fs';
import path from 'path';
import { doExtractContentPaths } from './xwalk-content.js';

export const XWALK_OPERATIONS = Object.freeze({
  UPLOAD: 'upload',
  GET_PAGE_PATHS: 'get-page-paths',
});

/**
 * Get and validate the required input for the action.
 * @param name
 * @returns {string}
 */
function getAndValidateInputs(name) {
  const value = core.getInput(name);
  if (!value) {
    throw new Error(`Input "${name}" is required.`);
  }
  return value;
}

/**
 * Upload the content package and asset mapping to AEM.
 * @param xwalkZipPath
 * @param assetMappingPath
 * @param target
 * @param accessToken
 * @param skipAssets
 * @returns {Promise<unknown>}
 */
async function doUpload(
  xwalkZipPath,
  assetMappingPath,
  target,
  accessToken,
  skipAssets = false,
) {
  return new Promise((resolve, reject) => {
    const args = [
      '@adobe/aem-import-helper',
      'aem',
      'upload',
      '--zip', xwalkZipPath,
      '--asset-mapping', assetMappingPath,
      '--target', target,
      '--token', accessToken,
    ];
    if (skipAssets) {
      args.push('--skip-assets');
    }

    // Try to make it easy to read in the logs.
    const suffixArray = ['', '', '\n>  ', '', '\n>  ', '', '\n>  ', '', '\n>  '];
    const maskedArgs = args.map((arg, index) => (arg === accessToken ? '***\n>  ' : `${arg}${suffixArray[index % suffixArray.length]}`));
    core.info('Running command:');
    core.info(`> npx ${maskedArgs.join(' ')}`);

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
        resolve();
      } else {
        reject(new Error(`AEM upload failed. Error: ${errorOutput}`));
      }
    });
  });
}

/**
 * Perform the XWalk operation (see action.yml for more details).
 *
 * | Operation       | Name                 | Description                           | Required |
 * |-----------------|----------------------|---------------------------------------|----------|
 * | INPUTS                                                                                    |
 * | *               | operation            | The XWalk operation to perform.       | Yes      |
 * | *               | zip_contents_path    | Path to Import zip contents.          | Yes      |
 * | UPLOAD          | access_token         | Base64 token for upload.              | No       |
 * | UPLOAD          | aem_author_url       | Target Adobe AEM Cloud URL.           | No       |
 * | UPLOAD          | content_package_path | Path to AEM package in zip contents.  | No       |
 * | UPLOAD          | skip_assets          | Agent name for log identification.    | No       |
 * |-----------------|----------------------|---------------------------------------|----------|
 * | OUTPUTS                                                                             |
 * | *               | error_message        | Error if operation could not complete.| Output   |
 * | GET_PAGE_PATHS  | content_package_path | Path to content package zip file.     | Output   |
 * | GET_PAGE_PATHS  | page_paths           | Comma-delimited list of page paths.   | Output   |
 *
 * @returns {Promise<void>}
 */
export async function run() {
  // Read common inputs and validate them.
  const operation = core.getInput('operation');
  const zipContentsPath = core.getInput('zip_contents_path');
  if (!zipContentsPath
    || !fs.existsSync(zipContentsPath)
    || !fs.statSync(zipContentsPath).isDirectory()) {
    throw new Error(`Zip Contents not found at path: ${zipContentsPath}`);
  }

  try {
    if (operation === XWALK_OPERATIONS.UPLOAD) {
      const accessToken = getAndValidateInputs('access_token');
      const target = getAndValidateInputs('aem_author_url');
      const contentPackagePath = getAndValidateInputs('content_package_path');
      const skipAssets = getAndValidateInputs('skip_assets') === 'true';

      if (!contentPackagePath
        || !fs.existsSync(contentPackagePath)
        || !fs.statSync(contentPackagePath).isFile()) {
        throw new Error(`Content package not found at path: ${contentPackagePath}`);
      }

      const url = new URL(target);
      const hostTarget = `${url.origin}/`;
      const assetMappingPath = `${zipContentsPath}/asset-mapping.json`;

      core.info(`✅ Uploading "${contentPackagePath}" and "${assetMappingPath}" to ${hostTarget}. Assets will ${skipAssets ? 'not ' : ''}be uploaded.`);

      await doUpload(
        contentPackagePath,
        assetMappingPath,
        hostTarget,
        accessToken,
        skipAssets,
      );
      core.info('✅ Upload completed successfully.');
    } else if (operation === XWALK_OPERATIONS.GET_PAGE_PATHS) {
      // Validate the existence of the asset mapping file
      const assetMappingPath = path.join(zipContentsPath, 'asset-mapping.json');
      if (!fs.existsSync(assetMappingPath)
        || !fs.statSync(assetMappingPath).isFile()) {
        throw new Error(`Asset mapping file not found at Import zip content path: ${assetMappingPath}`);
      }

      await doExtractContentPaths(zipContentsPath);
    }
  } catch (error) {
    core.warning(`Error: XWalk operation ${operation} failed: ${error.message}`);
    core.setOutput('error_message', `XWalk operation ${operation} failed: ${error.message}`);
  }
}

await run();

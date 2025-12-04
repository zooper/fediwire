#!/usr/bin/env node
import { execSync } from 'child_process';
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

try {
  // Get git commit hash
  const gitHash = execSync('git rev-parse --short HEAD').toString().trim();

  // Get git commit date
  const gitDate = execSync('git log -1 --format=%cd --date=format:"%Y-%m-%d %H:%M"').toString().trim();

  // Get current timestamp
  const buildDate = new Date().toISOString();

  const versionInfo = {
    hash: gitHash,
    commitDate: gitDate,
    buildDate: buildDate,
    version: `${gitHash} (${gitDate})`
  };

  const content = `// Auto-generated file - do not edit
export const VERSION_INFO = ${JSON.stringify(versionInfo, null, 2)};
`;

  writeFileSync(join(__dirname, '../src/version.ts'), content);
  console.log('✅ Version file generated:', versionInfo.version);
} catch (error) {
  console.error('❌ Failed to generate version:', error.message);
  // Fallback version if git is not available
  const fallbackVersion = {
    hash: 'unknown',
    commitDate: 'unknown',
    buildDate: new Date().toISOString(),
    version: 'dev'
  };

  const content = `// Auto-generated file - do not edit
export const VERSION_INFO = ${JSON.stringify(fallbackVersion, null, 2)};
`;

  writeFileSync(join(__dirname, '../src/version.ts'), content);
}

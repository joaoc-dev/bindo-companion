#!/usr/bin/env tsx
/**
 * Export OpenAPI specifications from running backend APIs.
 * Writes gitignored snapshots at repo root (openapi-companion.json, openapi-skull-king.json).
 */

import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const specs = [
  {
    name: 'companion',
    url:
      process.env.COMPANION_OPENAPI_URL ||
      'http://localhost:5100/openapi/v1.json',
    outputFile: resolve(process.cwd(), 'openapi-companion.json'),
  },
  {
    name: 'skull-king',
    url:
      process.env.SKULL_KING_OPENAPI_URL ||
      'http://localhost:5101/openapi/v1.json',
    outputFile: resolve(process.cwd(), 'openapi-skull-king.json'),
  },
];

async function exportOpenApiSpecs() {
  for (const spec of specs) {
    try {
      const response = await fetch(spec.url);
      if (!response.ok) {
        throw new Error(
          `Failed to fetch: ${response.status} ${response.statusText}`,
        );
      }
      const data = await response.json();
      writeFileSync(
        spec.outputFile,
        `${JSON.stringify(data, null, 2)}\n`,
        'utf-8',
      );
      console.log(`✅ [${spec.name}] Exported to ${spec.outputFile}`);
    }
    catch (error) {
      console.error(`❌ [${spec.name}] Error:`, error);
      process.exit(1);
    }
  }
}

exportOpenApiSpecs();

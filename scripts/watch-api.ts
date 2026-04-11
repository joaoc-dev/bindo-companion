import { execSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

interface SpecConfig {
  name: string;
  url: string;
  outputFile: string;
}

interface CacheEntry {
  hash: string;
  lastGenerated: string;
}

type Cache = Record<string, CacheEntry>;

const POLL_INTERVAL = 3000;
const CACHE_FILE = join(process.cwd(), '.openapi-cache.json');

const specs: SpecConfig[] = [
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

function getSpecHash(spec: string): string {
  return createHash('sha256').update(spec).digest('hex');
}

function loadCache(): Cache {
  if (existsSync(CACHE_FILE)) {
    try {
      return JSON.parse(readFileSync(CACHE_FILE, 'utf-8'));
    }
    catch {
      return {};
    }
  }
  return {};
}

function saveCache(cache: Cache): void {
  writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
}

function generateApi(): void {
  console.log('🔄 Regenerating API client...');
  try {
    execSync('npm run generate:api', { stdio: 'inherit', cwd: process.cwd() });
    console.log('✅ API client regenerated successfully');
  }
  catch (error) {
    console.error('❌ Failed to generate API client:', error);
  }
}

async function fetchSpec(config: SpecConfig): Promise<string | null> {
  try {
    const response = await fetch(config.url);
    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`);
    }
    return await response.text();
  }
  catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    if (
      msg.includes('ECONNREFUSED')
      || msg.includes('fetch failed')
      || (error instanceof TypeError && msg.includes('fetch'))
    ) {
      console.log(`⏳ [${config.name}] Waiting for API at ${config.url}...`);
    }
    else {
      console.error(`⚠️  [${config.name}] Failed to fetch spec:`, error);
    }
    return null;
  }
}

async function checkAndRegenerate(): Promise<void> {
  const cache = loadCache();
  let needsRegenerate = false;

  for (const spec of specs) {
    const text = await fetchSpec(spec);
    if (!text) continue;

    const currentHash = getSpecHash(text);
    const cached = cache[spec.name];

    try {
      const specJson = JSON.parse(text);
      writeFileSync(
        spec.outputFile,
        `${JSON.stringify(specJson, null, 2)}\n`,
        'utf-8',
      );
    }
    catch (error) {
      console.error(`⚠️  [${spec.name}] Failed to save spec file:`, error);
      continue;
    }

    if (!cached || cached.hash !== currentHash) {
      console.log(`💾 [${spec.name}] Spec changed`);
      cache[spec.name] = {
        hash: currentHash,
        lastGenerated: new Date().toISOString(),
      };
      needsRegenerate = true;
    }
  }

  const generatedExists =
    existsSync(
      join(process.cwd(), 'packages/api-client/api/generated/companion'),
    )
    && existsSync(
      join(process.cwd(), 'packages/api-client/api/generated/skull-king'),
    );

  if (needsRegenerate || !generatedExists) {
    generateApi();
    saveCache(cache);
  }
}

async function watch(): Promise<void> {
  console.log('👀 Watching OpenAPI specs:');
  for (const spec of specs) {
    console.log(`   [${spec.name}] ${spec.url}`);
  }
  console.log(`   Polling every ${POLL_INTERVAL / 1000} seconds\n`);

  await checkAndRegenerate();
  setInterval(checkAndRegenerate, POLL_INTERVAL);
}

watch().catch(console.error);

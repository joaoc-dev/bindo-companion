import { existsSync } from 'node:fs';
import { defineConfig } from 'orval';

const USE_FILE = process.env.ORVAL_USE_FILE === 'true';

const companionUrl =
  process.env.COMPANION_OPENAPI_URL || 'http://localhost:5100/openapi/v1.json';
const skullKingUrl =
  process.env.SKULL_KING_OPENAPI_URL ||
  'http://localhost:5101/openapi/v1.json';

const includeSkullKing =
  !USE_FILE || existsSync('./openapi-skull-king.json');

export default defineConfig({
  companion: {
    input: {
      target: USE_FILE ? './openapi-companion.json' : companionUrl,
    },
    output: {
      mode: 'tags-split',
      target: './packages/api-client/api/generated/companion',
      schemas: './packages/api-client/api/generated/companion/models',
      client: 'fetch',
      clean: true,
      override: {
        mutator: {
          path: './packages/api-client/api/mutators/companion.ts',
          name: 'companionInstance',
        },
      },
    },
  },
  ...(includeSkullKing
    ? {
        skullKing: {
          input: {
            target: USE_FILE ? './openapi-skull-king.json' : skullKingUrl,
          },
          output: {
            mode: 'tags-split',
            target: './packages/api-client/api/generated/skull-king',
            schemas: './packages/api-client/api/generated/skull-king/models',
            client: 'fetch',
            clean: true,
            override: {
              mutator: {
                path: './packages/api-client/api/mutators/skullKing.ts',
                name: 'skullKingInstance',
              },
            },
          },
        },
      }
    : {}),
});

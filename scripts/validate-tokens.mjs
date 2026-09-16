import { loadValidatedTokens } from './style-dictionary/tokens.mjs';

try {
  await loadValidatedTokens();
  console.log('Token validation passed.');
} catch (error) {
  console.error(`Token validation failed: ${error.message}`);
  process.exitCode = 1;
}

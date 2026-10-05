// Copies the photo essay's renditions (projects/photo-essay/big_assets/images, made by `npm run photos` there) into
// public/images, where React Router serves them as /images/…. Media lives once, in big_assets; this copy is
// gitignored and remade before every dev and build run.
import { cpSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const from = fileURLToPath(new URL('../../../projects/photo-essay/big_assets/images', import.meta.url));
const to = fileURLToPath(new URL('../public/images', import.meta.url));
mkdirSync(to, { recursive: true });
cpSync(from, to, { recursive: true });
console.log(`copied photo renditions → public/images`);

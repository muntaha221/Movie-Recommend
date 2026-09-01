// build.js – invoked by Vercel via the 'vercel-build' npm script
// Performs installation, build, copy, and backend install in a cross‑platform way.
const { execSync } = require('node:child_process');
const path = require('node:path');
const fs = require('node:fs');

const root = __dirname;
const frontend = path.join(root, 'frontend');
const backend = path.join(root, 'backend');
const publicDir = path.join(root, 'public');

function run(cmd, cwd) {
  console.log(`Running: ${cmd} (in ${cwd})`);
  execSync(cmd, { cwd, stdio: 'inherit' });
}

// Frontend: install dependencies and build
run('npm install', frontend);
run('npm run build', frontend);

// Copy built assets to public folder
const dist = path.join(frontend, 'dist');
if (fs.existsSync(dist)) {
  fs.cpSync(dist, publicDir, { recursive: true });
  console.log('✅ Copied frontend dist to public');
} else {
  console.warn('⚠️ Frontend dist folder not found');
}

// Backend: install dependencies
run('npm install', backend);

console.log('✅ Build script completed');

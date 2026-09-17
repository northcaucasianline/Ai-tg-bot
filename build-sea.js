const fs = require('fs');
const path = require('path');
const cp = require('child_process');
const esbuild = require('esbuild');

const root = __dirname;
const dist = path.join(root, 'dist');
const buildDir = path.join(root, '.sea-build');
const bundle = path.join(buildDir, 'sea-entry.cjs');
const configFile = path.join(buildDir, 'sea-config.json');
const blob = path.join(buildDir, 'sea-prep.blob');
const exe = path.join(dist, 'AiTGAida-Anna.exe');

function run(cmd, args) {
  console.log('>', cmd, args.join(' '));
  cp.execFileSync(cmd, args, { cwd: root, stdio: 'inherit', windowsHide: false });
}
function rm(p) { fs.rmSync(p, { recursive: true, force: true }); }
function mkdir(p) { fs.mkdirSync(p, { recursive: true }); }

(async () => {
  const major = Number(process.versions.node.split('.')[0]);
  const minor = Number(process.versions.node.split('.')[1]);
  if (major < 20 || (major === 20 && minor < 6)) {
    throw new Error(`Node.js ${process.versions.node} is too old. Install Node.js 20.6+ on the BUILD computer.`);
  }
  if (process.platform !== 'win32' || process.arch !== 'x64') {
    throw new Error('This builder is intended to run on Windows x64.');
  }

  rm(buildDir); mkdir(buildDir); mkdir(dist);
  if (fs.existsSync(exe)) fs.unlinkSync(exe);

  console.log('Bundling application...');
  await esbuild.build({
    entryPoints: [path.join(root, 'sea-entry.js')],
    bundle: true,
    platform: 'node',
    format: 'cjs',
    target: 'node20',
    outfile: bundle,
    sourcemap: false,
    minify: false,
    legalComments: 'none'
  });

  const config = {
    main: bundle,
    output: blob,
    disableExperimentalSEAWarning: true,
    useSnapshot: false,
    useCodeCache: false
  };
  fs.writeFileSync(configFile, JSON.stringify(config, null, 2));

  console.log('Creating SEA preparation blob...');
  run(process.execPath, ['--experimental-sea-config', configFile]);

  console.log('Copying Node runtime...');
  fs.copyFileSync(process.execPath, exe);

  const postject = path.join(root, 'node_modules', '.bin', process.platform === 'win32' ? 'postject.cmd' : 'postject');
  if (!fs.existsSync(postject)) throw new Error('postject was not installed. Run npm install again.');

  console.log('Injecting application into EXE...');
  const postjectArgs = [
    exe,
    'NODE_SEA_BLOB',
    blob,
    '--sentinel-fuse',
    'NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2',
    '--overwrite'
  ];
  // Windows PowerShell cannot execute a .cmd shim via spawnSync directly (EINVAL).
  if (process.platform === 'win32' && postject.toLowerCase().endsWith('.cmd')) {
    run(process.env.ComSpec || 'cmd.exe', ['/d', '/s', '/c', postject, ...postjectArgs]);
  } else {
    run(postject, postjectArgs);
  }

  console.log('');
  console.log('BUILD SUCCESSFUL');
  console.log(exe);
  console.log('');
  console.log('The target PC does not need Node.js, npm, VS Code, Python or Git.');
  console.log('Place .env and data\\character.json next to the EXE.');
})().catch(err => {
  console.error('EXE build failed.');
  console.error(err && err.stack ? err.stack : err);
  process.exitCode = 1;
});

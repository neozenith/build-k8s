#! /usr/bin/env node
const { spawn, spawnSync } = require('child_process');
const crypto = require('crypto');
const fs = require('fs');

async function main() {
  const targets = discoverTargets('./', 'Dockerfile');
  console.log(`Discovered Targets:${targets}`);

  const dockerBuildPromises = targets.map((t) => {
    run('docker', ['build', '-t', `${t}:latest`, `./${t}`], t)
  });
  await Promise.all(dockerBuildPromises);

  // await run('kubectl', ['apply', '-f', './k8s/*.yml']);
};

function run(command, args, tag = "") {
  const fg = ansiColorFromHash(tag);
  const prefix = `${fg}[${tag}] stdout${C.Reset}:`;
  const ErrPrefix = `${C.BgRed}stderr${C.Reset}: `;

  return new Promise((resolve, reject) => {
    const cmd = spawn(command, args);
    cmd.stdout.on('data', (data)=>{ console.log(`${prefix}${prettyLog(data, prefix)}`)});
    cmd.stderr.on('data', (data)=>{ console.log(`${ErrPrefix}${prettyLog(data, ErrPrefix)}`)});
    cmd.on('close', (code)=>{resolve(code)});
  });
}

function discoverTargets(path, target){
  const dirents = fs.readdirSync(path, {withFileTypes: true});
  const directories = dirents.filter((de) => de.isDirectory());
  const dockerDirs = directories.filter((d) => {
    return fs.readdirSync(d.name).filter((e) => e === target).length === 1;
  }).map((e) => e.name);
  return dockerDirs;
}

function prettyLog(data, prefix){
  return data.toString('utf-8').trim().split('\n').join(`\n${prefix}`).trim();
}

function ansiColorFromHash(text, background=false){
  const hash = crypto.createHash('md5').update(text).digest('hex');
  const fgPalette = [C.FgGreen, C.FgYellow, C.FgBlue, C.FgMagenta, C.FgCyan, C.FgWhite];
  const bgPalette = [C.BgGreen, C.BgYellow, C.BgBlue, C.BgMagenta, C.BgCyan, C.BgWhite];
  const colourNum = parseInt(hash.substring(0,3), 16) % fgPalette.length;
  if (background)
    return bgPalette[fgPalette.length - colourNum - 1];
  else
    return fgPalette[colourNum];
}
// ANSI COLORS
const C = {
  Reset: "\x1b[0m",
  Bright: "\x1b[1m",
  Dim: "\x1b[2m",
  Underscore: "\x1b[4m",
  Blink: "\x1b[5m",
  Reverse: "\x1b[7m",
  Hidden: "\x1b[8m",

  FgBlack: "\x1b[30m",
  FgRed: "\x1b[31m",
  FgGreen: "\x1b[32m",
  FgYellow: "\x1b[33m",
  FgBlue: "\x1b[34m",
  FgMagenta: "\x1b[35m",
  FgCyan: "\x1b[36m",
  FgWhite: "\x1b[37m",

  BgBlack: "\x1b[40m",
  BgRed: "\x1b[41m",
  BgGreen: "\x1b[42m",
  BgYellow: "\x1b[43m",
  BgBlue: "\x1b[44m",
  BgMagenta: "\x1b[45m",
  BgCyan: "\x1b[46m",
  BgWhite: "\x1b[47m"
}

main();

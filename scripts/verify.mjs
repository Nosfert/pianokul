import {spawnSync} from 'node:child_process';
import {existsSync,lstatSync,readFileSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
process.chdir(root);
function fail(message){console.error(message);process.exit(1);}
if(existsSync('node_modules') && lstatSync('node_modules').isSymbolicLink())fail('STOP: node_modules is a symlink. Ask the orchestrator for a worktree-local install; do not change the main checkout.');
for(const args of [['ci'],['run','check'],['test'],['run','build']]){
 console.log(`\n> npm ${args.join(' ')}`);
 const result=spawnSync('npm',args,{stdio:'inherit'});
 if(result.status!==0)fail(`FAILED: npm ${args.join(' ')} (${result.status ?? result.error})`);
}
for(const path of ['build/index.html','build/_headers','build/robots.txt'])if(!existsSync(path))fail(`Missing ${path}`);
const config=readFileSync('wrangler.toml','utf8');
if(!config.includes('name = "pianokul"') || !/\[assets\]\s*\ndirectory = "\.\/build"/.test(config))fail('Wrangler config must deploy build/ as static assets of the pianokul Worker.');
const grep=spawnSync('grep',['-R','-n','-E','skolweb\\.|Skolkul','src'],{encoding:'utf8'});
if(grep.status===0)fail(`Unexpected inspiration-project leftovers:\n${grep.stdout}`);
if(grep.status!==1)fail(`Source grep failed: ${grep.stderr}`);
console.log('VERIFIED: install, Svelte/TypeScript, all tests (including UI-key grep and sv/en parity), static build and Cloudflare config. Browser/sound/MIDI hardware/live deployment remain manual.');

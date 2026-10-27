import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
const walk=p=>fs.readdirSync(p,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(p,e.name)):[path.join(p,e.name)]);
const files=walk('dist').filter(p=>!/[\\/](sw|precache)\.js$/.test(p)&&!/[\\/]assets[\\/].*\.(png|jpe?g|webp|gif|woff)$/.test(p)).map(p=>'/'+p.replace(/^dist[\\/]/,'').replaceAll('\\','/'));files.push('/');
fs.writeFileSync('dist/precache.js','self.SOLO_PRECACHE='+JSON.stringify(files)+';');
const hash=createHash('sha256');for(const file of walk('dist').sort()){hash.update(file);hash.update(fs.readFileSync(file));}const version=hash.digest('hex').slice(0,16);fs.writeFileSync('dist/sw.js',fs.readFileSync('dist/sw.js','utf8').replace('solo-shell-v1','solo-shell-'+version));

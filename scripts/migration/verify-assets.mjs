// Offline verification of original/downloaded target bytes. No upload or deletion.
import { readFile,writeFile,realpath } from 'node:fs/promises';
import { resolve,relative,dirname } from 'node:path';
import { createHash } from 'node:crypto';
const [mapArg,outArg]=process.argv.slice(2);
if(!mapArg||!outArg)throw new Error('Usage: node scripts/migration/verify-assets.mjs <private-map.json> <private-verified-map.json>');
const file=await realpath(mapArg), output=resolve(outArg),repo=await realpath('.');
if(!relative(repo,file).startsWith('..')||!relative(repo,output).startsWith('..'))throw new Error('Use a protected workspace outside the repository.');
const maps=JSON.parse(await readFile(file,'utf8'));if(!Array.isArray(maps))throw new Error('Asset map must be an array.');
const checked=[];
for(const m of maps){
 if(!m.sourceLocalFile||!m.targetLocalFile||!m.sourceGeneration)throw new Error('Source generation and original/target download paths required.');
 const source=await readFile(resolve(dirname(file),m.sourceLocalFile)), target=await readFile(resolve(dirname(file),m.targetLocalFile));
 const hash=b=>createHash('sha256').update(b).digest('hex');
 if(source.length!==target.length||hash(source)!==hash(target))throw new Error('Asset byte mismatch; no verified manifest written.');
 const signatures={'image/png':source.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])),'image/jpeg':source[0]===255&&source[1]===216&&source[2]===255,'image/webp':source.toString('ascii',0,4)==='RIFF'&&source.toString('ascii',8,12)==='WEBP'};
 if(!signatures[m.mimeType])throw new Error('Unrecognized or conflicting raster MIME signature; inspect/quarantine source.');
 checked.push({...m,bytes:source.length,sha256:hash(source),verified:true});
}
await writeFile(output,JSON.stringify(checked,null,2)+'\n',{mode:0o600,flag:'wx'});
console.log(`Verified ${checked.length} original/target byte pairs offline. Visibility/ownership and hosted permissions still require review.`);

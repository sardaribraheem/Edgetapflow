// Offline sanitized Auth migration plan. Does not create accounts or send email.
// Original hash/metadata export must remain in a protected source backup.
import { readFile,writeFile,realpath } from 'node:fs/promises';
import { resolve,relative } from 'node:path';
const [sourceArg,outputArg]=process.argv.slice(2);
if(!sourceArg||!outputArg)throw new Error('Usage: node scripts/migration/prepare-auth.mjs <private-users.json> <private-auth-plan.json>');
const source=await realpath(sourceArg),output=resolve(outputArg),repo=await realpath('.');
if(!relative(repo,source).startsWith('..')||!relative(repo,output).startsWith('..'))throw new Error('Auth artifacts must remain outside the repository.');
const input=JSON.parse(await readFile(source,'utf8')), users=Array.isArray(input)?input:input.users;
if(!Array.isArray(users))throw new Error('Unrecognized Auth export format.');
const ids=new Set(),emails=new Set(),plans=[];
for(const u of users){const uid=u.uid||u.localId;const email=u.email?.trim().toLowerCase();if(!uid||ids.has(uid)||!email||emails.has(email))throw new Error('Missing/duplicate Auth identity; reconcile before creating destination accounts.');ids.add(uid);emails.add(email);
 const providers=u.providerData||u.providerUserInfo||[];const providerIds=providers.map(p=>p.providerId);
 if(providerIds.some(p=>p!=='password'))throw new Error('Additional Auth providers require a separate verified provider-linking plan.');
 plans.push({firebaseUid:uid,email,emailVerified:u.emailVerified===true,disabled:u.disabled===true,displayName:u.displayName||null,providerIds,sourceCreatedAt:u.metadata?.creationTime||u.createdAt||null,sourceLastSignInAt:u.metadata?.lastSignInTime||u.lastLoginAt||null,passwordStrategy:'UNDECIDED: verified recovery or reviewed SCRYPT bridge',safeMetadata:{}});
}
await writeFile(output,JSON.stringify({project:'edgetapflow',status:'planned-not-imported',users:plans},null,2)+'\n',{flag:'wx',mode:0o600});
console.log(`Prepared sanitized Auth plan for ${plans.length} users. No accounts created, hashes exposed or emails sent. Original source backup retained separately.`);

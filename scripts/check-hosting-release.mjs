// Check the actual static export before publishing to the approved Hosting site.
// This command performs no network request and never prints configuration values.
import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';

try {
  const config = JSON.parse(await readFile('firebase.json', 'utf8'));
  const project = JSON.parse(await readFile('supabase/project.json', 'utf8'));
  assert.equal(project.project_ref, 'dxyxvervvlxhwwbcbttd', 'Unexpected Supabase project.');
  assert.equal(config.hosting.public, 'out', 'Hosting must serve the static export.');
  assert.equal(config.hosting.cleanUrls, true, 'Clean account/profile URLs are required.');
  assert(config.hosting.rewrites.some(rule => rule.source === '/u/**' && rule.destination === '/profile.html'), 'Profile handle rewrite is missing.');

  const required = ['index.html', 'admin.html', 'account.html', 'account/recovery.html', 'account/orders.html', 'account/profile.html', 'create-profile.html', 'order.html', 'profile.html', 'privacy.html', 'terms.html', 'cookies.html', 'robots.txt', 'sitemap.xml', 'tools/edgetap-unlock.mjs'];
  for (const file of required) await readFile(join('out', file));
  const files = await readdir('out', { recursive: true });
  // Webpack metadata chunks live inside directories named robots.txt/sitemap.xml.
  // Scan their contents as usual, while reading only actual text files.
  const publicFiles = [];
  for (const file of files) {
    if (/\.(html|m?js|json|txt|css|xml)$/.test(file) && (await stat(join('out', file))).isFile()) publicFiles.push(file);
  }
  assert(!files.some(file => file.split(/[\\/]/).some(part => part.startsWith('.env'))), 'Environment files must not enter the export.');
  let compiled = '';
  for (const file of publicFiles) {
    const source = await readFile(join('out', file), 'utf8');
    assert(!/edgetap-migration-test\.supabase\.co|sb_publishable_edgetap_local_test_only/.test(source), 'A local fixture export cannot be released.');
    assert(!/sbp_[a-f0-9]{40}|sb_secret_[A-Za-z0-9_-]{16,}|-----BEGIN (?:RSA |EC )?PRIVATE KEY-----/.test(source), 'A privileged credential pattern was found; release stopped.');
    for (const candidate of source.matchAll(/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g)) {
      let payload;
      try { payload = JSON.parse(Buffer.from(candidate[0].split('.')[1], 'base64url').toString()); } catch { continue; }
      assert.notEqual(payload.role, 'service_role', 'A server JWT must not enter the browser export.');
    }
    if (file.endsWith('.js')) compiled += source;
  }
  assert(compiled.includes(`${project.project_ref}.supabase.co`), 'The real Supabase backend is absent from the compiled browser code.');
  await import('./test-seo.mjs');
  console.log(`PASS Hosting release: ${publicFiles.length} public text assets checked; approved Supabase project, account routes, profile rewrite and credential/fixture guards verified. No deployment performed.`);
} catch (error) {
  console.error(`HOSTING RELEASE BLOCKED: ${error.message}`);
  process.exitCode = 1;
}

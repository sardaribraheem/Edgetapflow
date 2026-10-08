// Local PostgreSQL guard tests. No hosted access or production records.
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { createTestDatabase } from './supabase-test-db.mjs';

const db = await createTestDatabase({ migrate: false });
try {
  const foundation = (await readdir('supabase/migrations')).filter(name => name.endsWith('.sql') && name < '202610070007').sort();
  for (const name of foundation) await db.exec(await readFile(`supabase/migrations/${name}`, 'utf8'));
  await db.exec('create schema supabase_migrations; create table supabase_migrations.schema_migrations(version text primary key)');
  for (const name of foundation) await db.query('insert into supabase_migrations.schema_migrations values ($1)', [name.split('_')[0]]);
  const owner = '22222222-2222-4222-8222-222222222222';
  await db.query('insert into auth.users values ($1,$2)', [owner, 'upgrade-local@example.test']);
  const guard = await readFile('supabase/require-ordering-upgrade.sql', 'utf8');
  await db.exec(guard);
  const inspection = await db.exec(await readFile('supabase/inspect-ordering-upgrade.sql', 'utf8'));
  const inventory = inspection.find(result => result.rows.length)?.rows[0].ordering_upgrade_inspection;
  assert.equal(inventory.counts.auth_users, 1);
  assert.equal(inventory.application_table_present, false);
  assert.equal(inventory.private_schema_exposed, false);

  await db.query('insert into supabase_migrations.schema_migrations values ($1)', ['202610070007']);
  await assert.rejects(() => db.exec(guard), /changed\/partial history/);
  await db.exec('rollback');
  await db.query('delete from supabase_migrations.schema_migrations where version=$1', ['202610070007']);

  await db.exec('create table public.order_applications(id integer); alter table public.order_applications enable row level security');
  await assert.rejects(() => db.exec(guard), /Conflicting workflow object/);
  await db.exec('rollback; drop table public.order_applications');

  await db.exec('grant usage on schema private to authenticated');
  await assert.rejects(() => db.exec(guard), /Private schema is exposed/);
  await db.exec('rollback; revoke usage on schema private from authenticated');

  await db.exec('alter table public.customers disable row level security');
  await assert.rejects(() => db.exec(guard), /RLS disabled/);
  await db.exec('rollback; alter table public.customers enable row level security');
  await db.exec(guard);
  assert.equal((await db.query('select count(*)::int as n from auth.users')).rows[0].n, 1);
  const pending = (await readdir('supabase/migrations')).filter(name => name.endsWith('.sql') && name >= '202610070007').sort();
  for (const name of pending) {
    await db.exec(await readFile(`supabase/migrations/${name}`, 'utf8'));
    await db.query('insert into supabase_migrations.schema_migrations values ($1)', [name.split('_')[0]]);
  }
  await db.exec(await readFile('supabase/verify-ordering-upgrade.sql', 'utf8'));
  assert.equal((await db.query('select count(*)::int as n from auth.users')).rows[0].n, 1);
  console.log('PASS upgrade guard permits existing accounts, reports counts, rejects partial history/conflicts/exposed private schema/disabled RLS and preserves data. Local PostgreSQL only.');
} finally {
  await db.close();
}

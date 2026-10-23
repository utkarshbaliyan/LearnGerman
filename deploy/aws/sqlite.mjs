import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

// Keep the existing SQL, transaction boundaries and Drizzle D1 interface on
// one EC2 host. Never point multiple hosts at this SQLite file.
export function openSqlite(filename, { readOnly = false } = {}) {
  if (filename !== ':memory:') mkdirSync(dirname(filename), { recursive: true, mode: 0o700 });
  const sqlite = new DatabaseSync(filename, {readOnly});
  if (!readOnly) sqlite.exec('PRAGMA journal_mode=WAL; PRAGMA synchronous=FULL;');
  sqlite.exec('PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000;');
  const statements = new WeakMap();
  function prepare(sql, params = []) {
    const statement = {
      bind(...values) { return prepare(sql, values); },
      async all() { return execute(statement); },
      async run() { return execute(statement); },
      async first(column) {
        const row = execute(statement).results[0];
        return row ? (column === undefined ? row : row[column]) : null;
      },
      async raw(options = {}) {
        const compiled = compile(sql);
        compiled.setReturnArrays(true);
        const rows = compiled.all(...params);
        return options.columnNames ? [compiled.columns().map(c => c.name), ...rows] : rows;
      },
    };
    statements.set(statement, {sql, params});
    return statement;
  }
  function compile(sql) {
    const statement = sqlite.prepare(sql);
    if (readOnly && !/^\s*(SELECT|WITH|EXPLAIN)\b/i.test(sql)) throw new Error('Database is read-only during migration.');
    return statement;
  }
  function execute(statement) {
    const {sql, params} = statements.get(statement);
    const compiled = compile(sql);
    const changesBefore = sqlite.prepare('SELECT total_changes() AS n').get().n;
    const results = compiled.columns().length ? compiled.all(...params).map(row => ({...row})) : (compiled.run(...params), []);
    const changes = sqlite.prepare('SELECT total_changes() AS n').get().n - changesBefore;
    return {success: true, results, meta: {changes, last_row_id: Number(sqlite.prepare('SELECT last_insert_rowid() AS n').get().n)}};
  }
  return {
    prepare,
    async batch(batch) {
      sqlite.exec(readOnly ? 'BEGIN' : 'BEGIN IMMEDIATE');
      try {
        const results = batch.map(execute);
        sqlite.exec('COMMIT');
        return results;
      } catch (error) { sqlite.exec('ROLLBACK'); throw error; }
    },
    close: () => sqlite.close(),
    sqlite,
  };
}

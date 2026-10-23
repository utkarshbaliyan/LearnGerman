import {DatabaseSync} from 'node:sqlite';
import {readFileSync,realpathSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';

const columns={users:['id','email','display_name','created_at','updated_at','username'],user_progress:['user_id','scope','data','updated_at'],
  tutor_sessions:['user_id','task_id','data','version','updated_at'],tutor_quotas:['user_id','day','used','generated','checked']};
export function importSnapshot(filename,snapshot,{replaceReadOnly=false}={}){
  if(snapshot.version!==1||!snapshot.tables||Object.keys(snapshot.tables).sort().join()!==Object.keys(columns).sort().join())throw new Error('Invalid snapshot format.');
  const db=new DatabaseSync(filename);
  try {
    db.exec('PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000; BEGIN IMMEDIATE;');
    const current=Object.keys(columns).reduce((n,table)=>n+db.prepare(`SELECT count(*) AS n FROM ${table}`).get().n,0);
    if(current&&!replaceReadOnly)throw new Error('Refusing to overwrite a populated learner database.');
    if(replaceReadOnly){
      if(process.env.LESELAUT_READ_ONLY!=='1')throw new Error('Replacement is permitted only in read-only staging.');
      for(const name of ['user_progress','users','tutor_sessions','tutor_quotas'])db.exec(`DELETE FROM ${name}`);
    }
    const counts={};
    for(const [table,fields] of Object.entries(columns)){
      let rows=snapshot.tables[table];if(!Array.isArray(rows))throw new Error('Invalid snapshot rows.');
      // Accept the original export shape, without discarding newer sentence counters.
      if(table==='tutor_quotas') rows=rows.map(row=>Object.keys(row).sort().join()==='day,used,user_id'?{...row,generated:0,checked:0}:row);
      const statement=db.prepare(`INSERT INTO ${table} (${fields.join(',')}) VALUES (${fields.map(()=>'?').join(',')})`);
      for(const row of rows){
        if(Object.keys(row).sort().join()!==[...fields].sort().join())throw new Error(`Unexpected schema for ${table}.`);
        statement.run(...fields.map(field=>row[field]));
      }
      counts[table]=db.prepare(`SELECT count(*) AS n FROM ${table}`).get().n;
      if(counts[table]!==rows.length)throw new Error('Snapshot count mismatch.');
      const stored=db.prepare(`SELECT ${fields.join(',')} FROM ${table}`).all();
      const values=items=>items.map(row=>fields.map(field=>row[field]));
      if(JSON.stringify(values(stored))!==JSON.stringify(values(rows)))throw new Error('Snapshot values differ after import.');
    }
    if(db.prepare('PRAGMA foreign_key_check').all().length||db.prepare('PRAGMA integrity_check').get().integrity_check!=='ok')throw new Error('Snapshot integrity check failed.');
    db.exec('COMMIT');
    return {counts,sha256:createHash('sha256').update(JSON.stringify(snapshot.tables)).digest('hex')};
  }catch(error){db.exec('ROLLBACK');throw error;}finally{db.close();}
}
if(process.argv[1]&&import.meta.url===pathToFileURL(realpathSync(process.argv[1])).href){
  const snapshot=JSON.parse(readFileSync(0,'utf8'));
  const result=importSnapshot(process.env.LESELAUT_SQLITE_PATH,snapshot,{replaceReadOnly:process.argv.includes('--replace-read-only')});
  console.log(JSON.stringify(result));
}

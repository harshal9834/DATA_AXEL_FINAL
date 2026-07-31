const { Client } = require('pg');

const passwords = ['password', 'postgres', 'admin', 'root', '1234', ''];
const users = ['postgres', 'admin', 'root'];

async function test() {
  for (const u of users) {
    for (const p of passwords) {
      try {
        const c = new Client(`postgresql://${u}:${p}@localhost:5432/postgres`);
        await c.connect();
        console.log(`Success with user: ${u} and password: ${p}`);
        await c.end();
        return;
      } catch(e) {
        // console.log(`Failed for ${u}:${p}`);
      }
    }
  }
  console.log('None worked');
}
test();

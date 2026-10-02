// Checks the GitHub Actions workflow runs the full test suite on every push and pull request.
const fs=require('fs'), path=require('path');
const ROOT=__dirname;
const WF=path.join(ROOT,'.github','workflows','test.yml');
const r=[];
const yml=fs.existsSync(WF)?fs.readFileSync(WF,'utf8').replace(/\r\n/g,'\n'):'';
const on=(yml.match(/^on:\s*\n((?:[ \t]+.*\n?)*)/m)||[])[1]||'';
r.push(['workflow file exists', yml.length>0]);
r.push(['runs on push', /^\s+push:/m.test(on)]);
r.push(['runs on pull_request', /^\s+pull_request:/m.test(on)]);
r.push(['no branch filters', !/branches|paths|tags/.test(on)]);
r.push(['installs from lockfile', /run:\s*npm ci\b/.test(yml) && fs.existsSync(path.join(ROOT,'package-lock.json'))]);
r.push(['runs npm test', /run:\s*npm test\b/.test(yml)]);
r.push(['read-only token', /permissions:\s*\n\s+contents:\s*read/.test(yml)]);
console.log(r.map(x=>(x[1]?'PASS ':'FAIL ')+x[0]).join('\n'));

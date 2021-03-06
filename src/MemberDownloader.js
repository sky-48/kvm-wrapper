const http = require('http');
const fs = require('fs');

const API_END_POINTS = [
  { name: "SNH48", url: "http://h5.snh48.com/resource/jsonp/members.php?gid=10" },
  { name: "BEJ48", url: "http://h5.snh48.com/resource/jsonp/members.php?gid=20" },
  { name: "GNZ48", url: "http://h5.snh48.com/resource/jsonp/members.php?gid=30" },
  { name: "SHY48", url: "http://h5.snh48.com/resource/jsonp/members.php?gid=40" },
  { name: "CKG48", url: "http://h5.snh48.com/resource/jsonp/members.php?gid=50" },
]

const members = [];

Promise.all(API_END_POINTS.map(getMembers))
  .then(() => {
    console.log(`We found ${members.length} members in total.`)
    return members.map(m => {
      // return `${m.sname} (${m.abbr}) - ${m.pname}: Team ${m.tname}`
      const o = {}
      o.name = m.sname
      o.abbr = m.abbr
      o.group = m.pname
      o.team = m.tname
      return o;
    });
  })
  .then((data) => {
    fs.writeFile("./members.json", JSON.stringify({ time: Date.now(), data: data }), (err) => {
      console.log(`Saving to file ${err ? 'failed' : 'successful'}.`)
    });
  })
  .catch((err) => {
    console.log(err)
  });

function getMembers({ name, url }) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let json = '';
      res.on('data', (data) => { json += data });
      res.on('end', () => {
        try {
          result = JSON.parse(json);
          if (result.total != result.rows.length) {
            console.warn(`JSON claims ${result.total} members, but found ${result.rows.length}.`);
          }
          members.push(...result.rows);
          console.log(`Added ${result.rows.length} members in ${name}.`);
          resolve();
        } catch (err) {
          reject(err);
        }
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}
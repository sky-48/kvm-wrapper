const PATH_PERSISTENT_STORAGE = "/home/PERSISTENT_STORAGE";
const PATH_DOWNLOAD_FOLDER = PATH_PERSISTENT_STORAGE + "/downloads";
const PATH_SERVER_LOG = PATH_PERSISTENT_STORAGE + "/server_log.txt";

const fs = require('fs');
const express = require('express');
const app = express();
const KVMInvoker = require('./KvmInvoker.js');
const kvm48 = new KVMInvoker(0.98 /* hours */);

app.all("*", (req, res, next) => {
  log(`[Express]: ${req.ip} requests ${req.url}`);
  next();
});

app.get('/v1/get-status', (req, res) => {
  const response = {};
  response.running = kvm48.running;
  response.history = kvm48.invokeHistory;
  res.set({ 'content-type': 'application/json; charset=utf-8' });
  res.write(JSON.stringify(response));
  res.end();
});

app.get('/v1/get-files', (req, res) => {
  fs.readdir(PATH_DOWNLOAD_FOLDER, (err, files) => {
    res.set({ 'content-type': 'application/json; charset=utf-8' });
    res.write(JSON.stringify(
      files.filter(file => file[0] != ".").reverse().map(file => {
        const entry = {};
        entry.name = file;
        entry.url = "/v1/download/" + file;
        entry.size = fs.statSync(`${PATH_DOWNLOAD_FOLDER}/${file}`).size;
        return entry;
      })
    ));
    res.end();
  });
});

app.post('/v1/kvm48-invoke', (req, res) => {
  kvm48.invoke();
  res.end();
});

app.get('/v1/download/:file(*)', (req, res) => {
  const filename = req.params.file;
  log("Download " + filename);
  const path = `${PATH_DOWNLOAD_FOLDER}/${filename}`;
  res.download(path);
});

app.use(express.static(__dirname + '/public'));

app.listen(8048, () => {
  log("Listening on port 8048...");
});

function log(message) {
  const msg = `${Date.now()} : ${message}\n`;
  fs.appendFile(PATH_SERVER_LOG, msg, function (err) {
    if (err) {
      console.error(err);
    } else {
      console.log(msg);
    }
  });
}

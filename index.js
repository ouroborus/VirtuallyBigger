const express = require('express');
const https = require('https');
const fs = require('fs');
const path = require('path');

const app = express();
const key = fs.readFileSync('security/localhost.key');
const cert = fs.readFileSync('security/localhost.crt');
const host = '127.0.0.1';
const port = 3000;
const src = path.join(__dirname, 'src');

app.get('/', (req, res) => {
  res.sendFile(path.join(src, 'index.html'));
});

app.use(express.static('src'));

https.createServer({ key: key, cert: cert }, app).listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

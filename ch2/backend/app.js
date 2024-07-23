var express = require('express');
var session = require('express-session');
var Keycloak = require('keycloak-connect');
var cors = require('cors');
var path = require('path');

var app = express();

app.use(cors());

var memoryStore = new session.MemoryStore();

app.use(session({
  secret: 'some secret',
  resave: false,
  saveUninitialized: true,
  store: memoryStore
}));

// keycloak.json 파일을 사용하여 설정 로드
var keycloakConfigPath = path.join(__dirname, 'keycloak.json'); // BE 서버에서 403 access deny 적용. (책과 동일)
// var keycloakConfigPath = path.join(__dirname, 'tmp-keycloak.json'); // BE 서버에서 realm 접속 화면으로 redirect 됨. (책과 다름)

// var keycloak = new Keycloak({ store: memoryStore }, keycloakConfigPath); // 됨
var keycloak = new Keycloak({ store: memoryStore }, keycloakConfigPath, { logLevels: ['debug'] }); // 됨
// var keycloak = new Keycloak({ store: memoryStore }, { logLevels: ['debug'] }, keycloakConfigPath); // 안됨
// var keycloak = new Keycloak({ store: memoryStore }, { logLevels: ['debug'] }, {config: keycloakConfig}); // 안됨
// var keycloak = new Keycloak({ store: memoryStore }, {config: keycloakConfig}); // 안됨

// Keycloak 초기화 후 설정 확인 로그
console.log('Keycloak initialized:', keycloak);

app.use(function (err, req, res, next) {
  console.error('Error:', err);
  res.status(err.status || 500).json({ message: err.message });
});

app.use(keycloak.middleware());

app.get('/secured', keycloak.protect('realm:myrole'), function (req, res) {
  res.setHeader('content-type', 'text/plain');
  res.send('Secret message!');
});

app.get('/public', function (req, res) {
  res.setHeader('content-type', 'text/plain');
  res.send('Public message!');
});

app.get('/', function (req, res) {
  res.send('<html><body><ul><li><a href="/public">Public endpoint</a></li><li><a href="/secured">Secured endpoint</a></li></ul></body></html>');
});

app.listen(3000, function () {
  console.log('Started at port 3000');
});
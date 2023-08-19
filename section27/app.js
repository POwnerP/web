const path = require('path');

const express = require('express');

const userRoutes = require('./routes/users');
const db = require('./data/database');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'));
app.use('/images', express.static('images')); 
// 스태틱 매서드는 괄호안의 파일을 웹사이트 사용자가
// 제공받을 수 있도록 허용함. 원래 웹사이트 사용자가 제공되는 파일을
// 이용할 수 있는 것은 보안에 위험해서 허용하지 않음.
// + 콤마 앞에 경로를 추가하면 해당 경로로 시작되는 요청을 필터링하여 처리함.

app.use(userRoutes);

db.connectToDatabase().then(function () {
  app.listen(3000);
});

const path = require('path');

const express = require('express');

const blogRoutes = require('./routes/blog');

//database 파일에서 export한 몽고db서버 연결 관련된 함수를 사용하기 위해 함수가 들어있는 파일을 불러옴.
const db = require('./data/database');
const database = require('./data/database');

const app = express();

// Activate EJS view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true })); // Parse incoming request bodies
app.use(express.static('public')); // Serve static files (e.g. CSS files)

app.use(blogRoutes);

app.use(function (error, req, res, next) {
  // Default error handling function
  // Will become active whenever any route / middleware crashes
  console.log(error);
  res.status(500).render('500');
});


// 데이터베이스 연결을 확인하고 웹사이트 서버를 실행함.
// 데이터베이스 연결 함수는 비동기 함수이기 때문에 then을 통해 동기함수처럼 작동하게 하고, 또한 데이터베이스 서버가 활성화된 경우에만 웹사이트 서버를 실행하게 함.
db.connectToDatabase().then(function(){
  app.listen(3000);
});


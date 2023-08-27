const path = require('path');

const express = require('express');
const session = require('express-session');
const mongodbStore = require('connect-mongodb-session');

const db = require('./data/database');
const demoRoutes = require('./routes/demo');
const database = require('./data/database');

const MongoDBStore = mongodbStore(session); //컨스트럭터, 블루프린트, 객체... 이 문장 알아보기

const sessionStore = new MongoDBStore({ //MongoDBStore 은 컨스트럭터임
  uri: 'mongodb://localhost:27017', //몽고db 서버주소
  databaseName: 'auth-demo',  // 데이터를 저장할 데이터베이스 지정
  collection: 'sessions' // 데이터를 저장할 콜렉션 지정
});

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));

app.use(session({
  secret: 'super-secret', //이 문장이 무슨 용도인지 잘 모름.
  resave: false, // resave가 true면 실제 변경사항이 없어도 아무 요청만 있으면 데이터베이스에 새로 갱신하여 저장하기때문에 사용하지 않음.
  saveUninitialized: false , //false를 함으로써 실제 저장할 데이터가 있을 때에만 세션을 데이터베이스에 저장함.
  storage: sessionStore//세션데이터가 저장될 장소를 지정, 세션저장을 위해서 패키지를 다운받음, 파일접근과 데이터베이스 관리를 도와줌
  // npm install connect-mogodb-session
})); //세션은 모든 요청에 대해 실행됨.


//미들웨어는 모든 요청 이전에 실행됨. 따라서 직접 정의한 미들웨어를 생성하여 자주 불려지는 변수를 locals 라는 글로벌 변수에 저장하여 모든, 요청되는 페이지에서 사용할 수 있게됨.
app.use( async function(req, res, next) {
  const user = req.session.user;
  const isAuth = req.session.isAuthenticated;

  if( !user || !isAuth){
    return next(); // next메서드는 이 미들웨어가 실행된 후에 그 다음 미들웨어가 실행될 수 있도록 함. 없다면 다음 미들웨어는 실행되지 않고 요청이 바로 처리되기 시작함.
  }

  const userDoc = await db.getDb().collection('users').findOne({_id: user.id});
  const isAdmin = userDoc.isAdmin;

  res.locals.isAuth = isAuth;
  res.locals.isAdmin = isAdmin;

  next();
})

app.use(demoRoutes);


db.connectToDatabase().then(function () {
  app.listen(3000);
});

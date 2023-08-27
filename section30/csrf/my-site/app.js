const path = require('path');

const express = require('express');
const session = require('express-session');
const mongodbStore = require('connect-mongodb-session');
const csrf = require('csurf');

const db = require('./data/database');
const demoRoutes = require('./routes/demo');

const MongoDBStore = mongodbStore(session);

const app = express();

const sessionStore = new MongoDBStore({
  uri: 'mongodb://localhost:27017',
  databaseName: 'auth-demo',
  collection: 'sessions'
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));

app.use(session({
  secret: 'super-secret',
  resave: false,
  saveUninitialized: false,
  store: sessionStore,
  cookie: {
    maxAge: 2 * 24 * 60 * 60 * 1000,
    sameSite: 'lax' // samesite는 쿠키의 속성 중 하나인데, 사이트의 메인으로부터 온 요청에만 동봉된 쿠키를 수용한다는 설정문임.
                    // 따라서 csrf 공격과 같이 이메일에 동봉된 공격자의 사이트로부터 온 쿠키는 받지 않게되어 공격을 예방할 수 있음.
                    // 여러 사이트에서는 디폴트로 이 설정을 지원하여 꼭 코드로 쓰지 않아도 되나, 사파리나 몇 파이어폭스는 지원하지 않으므로 이 문장을 명시함.
  }
}));
app.use(csrf()); //미들웨어로 csrf 함수를 실행함. 아마도 요청에서 자동으로 _csrf라는 name을 가진 값을 찾게하는 함수인듯.
                  // 또한 함수가 session을 사용하기 때문에 session 미들웨어 뒤에 선언함.

app.use(async function(req, res, next) {
  const user = req.session.user;
  const isAuth = req.session.isAuthenticated;

  if (!user || !isAuth) {
    return next();
  }

  const userDoc = await db.getDb().collection('users').findOne({_id: user.id});
  const isAdmin = userDoc.isAdmin;

  res.locals.isAuth = isAuth;
  res.locals.isAdmin = isAdmin;
  res.locals.user = user;

  next();
});

app.use(demoRoutes);

app.use(function(error, req, res, next) {
  res.render('500');
})

db.connectToDatabase().then(function () {
  app.listen(3000);
});

const path = require('path');

const express = require('express');
const session = require('express-session');
const csrf = require('csurf');

//아웃소싱1
const sessionConfig = require('./config/session')
const db = require('./data/database');

//아웃소싱3
const authRoutes = require('./routes/auth');
const blogRoutes = require('./routes/blog');

//아웃소싱2
const authMiddleware = require('./middlewares/auth-middleware');

//아웃소싱1
const mongoDbSessionStore = sessionConfig.createSessionStore(session);

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));

//아웃소싱1
app.use(session(sessionConfig.createSessionConfig(mongoDbSessionStore)));
app.use(csrf());

//아웃소싱2
app.use(authMiddleware);

app.use(blogRoutes);
app.use(authRoutes);

app.use(function(error, req, res, next) {
  res.render('500');
})

db.connectToDatabase().then(function () {
  app.listen(3000);
});

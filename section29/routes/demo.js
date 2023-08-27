const mongodb = require('mongodb');
const express = require('express');

const db = require('../data/database');
const bcrypt = require('bcryptjs');

const router = express.Router();
const ObjectId = mongodb.ObjectId;

router.get('/', function (req, res) {
  res.render('welcome');
});

router.get('/signup', function (req, res) {
  let sessionInputData = req.session.inputData;

  if(!sessionInputData) { //세션에 데이터가 없는 경우 세션 데이터를 초기화함.
    sessionInputData = {
      hasError: false,
      email: '',
      confirmEmail: '',
      password: ''
    };
  }

  req.session.inputData = null;

  res.render('signup', {inputData: sessionInputData});
});

router.get('/login', function (req, res) {
  let sessionInputData = req.session.inputData;
  
  if(!sessionInputData) {
    sessionInputData = {
      hasError: false,
      email: '',
      password: ''
    };
  res.render('login', { inputData: sessionInputData });
}});


//아이디 생성 사이트에서 유저의 아이디와 패스워드를 입력받아 데이터베이스에 저장하는 과정.
router.post('/signup', async function (req, res) {
  const userData = req.body;
  const enteredEmail = userData.email; // userData['email]
  const enteredConfirmEmail = userData['confirm-email'] // '-'가 포함되면 .표시법으로 지명할 수 없어서 [''] 형식을 사용함.
  const enteredPassword = userData.password;
  //아래는 사용자가 아이디를 생성할 때 잘못 입력하는 경우를 검출하는 과정임.
  if(
    !enteredEmail ||  
    !enteredConfirmEmail ||
    !enteredPassword ||
    enteredPassword.trim() < 6 || // trim()함수는 데이터의 앞뒤의 여백(스페이스)를 없애줌.
    enteredEmail !== enteredConfirmEmail ||
    !enteredEmail.includes('@')
  ) {
    // Signup을 할때 잘못된 정보를 입력하면 입력한 데이터는 사라지고 사인업 페이지가 redirect되는데 
    // 이러면 불편하기 때문에 잘못된 정보를 유지하면서 redirect하기 위해서 세션을 이용하는 과정임. 
    req.session.inputData = {
      hasError: true,
      message: 'Invalid input - please check your data.',
      email: enteredEmail,
      confirmEmail: enteredConfirmEmail,
      password: enteredPassword
    };

    req.session.save(function() {
      // return res.render('signup');  이렇게 하지 않는 이유는 이렇게 할 시 요청이 전송되고 페이지가 렌더됐을 때 새로고침을 누르면 요청이 재전송된다는 오류를 뜨지 않게 하기 때문임.
      res.redirect('/signup');
    })
    return;
  }
  //아래는 이미 해당 이메일을 사용하는 유저가 있는 경우를 대비한 과정임.
  const existingUser = await db
  .getDb()
  .collection('users')
  .findOne({ email: enteredEmail });

  if(existingUser) {
    req.session.inputData = {
      hasError: true,
      message: 'submmited email is already in used',
      email: enteredEmail,
      confirmEmail: enteredConfirmEmail,
      password: enteredPassword
    };
    return res.redirect('/signup');
  }

  const hasedPassword = await bcrypt.hash(enteredPassword, 12);

  console.log(hasedPassword);

  const user = {
    email: enteredEmail,
    password: hasedPassword
  }


  await db.getDb().collection('users').insertOne(user);
  
  res.redirect('/login');
});

// 로그인 창에서 로그인하는 과정, 검증 및...
router.post('/login', async function (req, res) {
  const userData = req.body;
  const enteredEmail = userData.email; 
  const enteredPassword = userData.password;

  const existingUser = await db
    .getDb()
    .collection('users')
    .findOne({email: enteredEmail});
  
  if(!existingUser) {// findOne해서 일치하는 대상이 없으면 'undefined'를 반환하는 이는 'false'와 같음.
    req.session.inputData = {
      hasError: true,
      message: 'Id or Password are not correct',
      email: enteredEmail,
      password: enteredPassword
    };
    req.session.save(function(){
      res.redirect('/login'); //일치 대상이 없는 경우에는 로그인창으로 리다이렉트함.
    })
    return;
  }

  const passwordsAreEqual = await bcrypt.compare(
    enteredPassword, 
    existingUser.password
    );

  if(!passwordsAreEqual){
    req.session.inputData = {
      hasError: true,
      message: 'The password are in used',
      email: enteredEmail,
      confirmEmail: enteredConfirmEmail,
      password: enteredPassword
    };
    req.session.save(function(){
      res.redirect('/login');
    })
    return;
  }

  req.session.user = {id:existingUser._id, email: existingUser.email};
  req.session.isAuthenticated = true;

  req.session.save(function(){
    res.redirect('/profile');
  })
});

router.get('/admin', async function (req, res) {
  if(!req.session.isAuthenticated){ //요청의 세션에 속하는 isAuthenticated 변수를 참조함.
    return res.status(401).render('401');
  }

  const userId = new ObjectId(req.session.user.id);

  const user = await db.getDb().collection('users').findOne({_id: userId}); 
  console.log(req.session.user.id);

  if (!user || !user.isAdmin){
    return res.render('403');//403은 Authenticate하지만 Authorize 되지 않은 자가 권한이 필요한 곳에 접근할 때 나타내는 오류
  }
  res.render('admin');
});

router.get('/profile', function (req, res) {
  if(!req.session.isAuthenticated){ 
    return res.status(403).render('403');
  }
  res.render('profile');
});

// 세션이 생성된 상황에서 세션에 있는 인증데이터를 무효시키는 과정
router.post('/logout', function (req, res) {
  req.session.user = null; // 세션을 아예 지우는 것이 아니라 변수를 널값으로 만들어버림.
  req.session.isAuthenticated = null; // 세션을 아예 지우는 것이 아니라 변수를 널값으로 만들어버림.
  res.redirect('/');
});

module.exports = router;

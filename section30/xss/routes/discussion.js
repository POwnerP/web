const express = require('express');
const xss = require('xss'); 
//xss 패키지 불러오기

const db = require('../data/database');

const router = express.Router();

router.get('/', function (req, res) {
  res.redirect('/discussion');
});

router.get('/discussion', async function (req, res) {
  const comments = await db.getDb().collection('comments').find().toArray();
  res.render('discussion', { comments: comments });
});

router.post('/discussion/comment', async function (req, res) {
  const comment = {
    text: xss(req.body.comment)
    //sanitize 해야되는 데이터를 xss() 매서드로 묶음. -> 문장이 실행되면 해당 데이터는 자동으로 xss매서드에 의해 sanitize됨.
  };

  await db.getDb().collection('comments').insertOne(comment);

  res.redirect('/discussion');
});

module.exports = router;

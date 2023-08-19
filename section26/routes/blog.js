const express = require('express');
const mongodb = require('mongodb');

const db = require('../data/database');

const ObjectId = mongodb.ObjectId; // 이거 뭐지? 나중에도 나오는 내용인데 알아둬야함.

const router = express.Router();

router.get('/', function(req, res) {
  res.redirect('/posts');
});


// 461강의. 포스팅한 게시물을 나타나게하기위한 코드, db로부터 post콜렉션을 가져와 응답으로 전달함.
router.get('/posts', async function(req, res) {
  const posts = await db
     .getDb()
     .collection('post')
     .find({}).project({ title: 1, summary: 1, 'author.name': 1 })
     // -> 이 줄의 문장은 몽고 셀로는 맞는 명령어지만 노드js에서는 틀린 문장임, 대신에 project()메서드를 활용함.   .find({},{title:1, summary:1, 'author.name':1})
     .toArray();
  res.render('posts-list', { posts:posts});
});

//459강의. 작성자(author) 리스트를 가져와서 글 작성 시에 드롭다운에 넣어 작성자를 선택할 수 있게하는 과정 [create-post.ejs 28번째 줄과 연관됨]
router.get('/new-post', async function(req, res) {
  // 데이터의 전달 과정 / app.js의 마지막 문단에서 데이터베이스가 database 변수에 할당되고 서버가 실행됨 -> blog.js는 export되어 app.js에서 참조됨 -> 이 문단에서 getdb 함수를 통해 이미 선언된 database 변수 호출하고 활용(find 함수 등)
  // .collection 함수를 통해 데이터베이스 내의 authors라는 콜렉션을 선택하고 그 뒤는 몽고db쉘과 명령문이 동일함.
  const authors = await db.getDb().collection('authors').find().toArray();
  res.render('create-post', {authors: authors});
});


//460강의, 새 게시물을 작성하는 코드임.
router.post('/post', async function(req,res){             //이 문장 밑으로 2번째 문장을 위해 async를 함. 왜지?
  const authorId = new ObjectId(req.body.author);   //mongodb라는 패키지의 함수?인 ObjectId를 사용하여 그냥 문장이 아닌 ObjectId 형식으로 값을 저장함. 그렇지 않으면 밑의 문장에서 검색한 id값과 실제 데이터베이스 값이 일치하지 않아서 find에 아무 것도 검색되지 않음.
  const author = await db.getDb().collection('authors').findOne({ _id: authorId })

  const newPost = {
    title: req.body.title,
    summary: req.body.summary,
    body: req.body.content,
    date: new Date(), //현재 시간을 나타내기 위한 문장. new Date()메서드? 알아둘것.
    author: {
      id: authorId,
      name: author.name,
      email: author.email
    }
  };

  const result = await db.getDb().collection('post').insertOne(newPost);  // result에 저장되는 값은 객체,newPost
  console.log(result);

  res.redirect('/posts');
})

//올릴 게시물 리스트에서 게스트의 detail버튼을 눌러 디테일 사이트로 이동하는 요청을 처리하는 부분
router.get('/posts/:id', async function(req,res){
  //params 객체에는 /:~~ 속의 '~~'에 해당하는 값들이 저장됨. params객체에서 이 값들을 참조하자면 req.params.~~ 식으로 참조하면 됨.
  const postId = req.params.id;
  const post = await db.getDb().collection('post').findOne({_id: new ObjectId(postId)},{summary:0});

  if (!post) {
    return res.status(404),render('404');
  }

  post.humanReadableDate = post.date.toLocaleDateString('en-US', {    //  toLocaleDateString 매세드는 데이터를 사람이 읽기 쉽도록 변환헤주는 메서드임. 다양한 속성을 추가해서 원하는 값의 형태로 값을 변형할 수 있음. 
    weekday: 'long',
    year:'numeric',
    month: 'long',
    day: 'numeric'
  });
  post.date = post.date.toISOString();  // toISOString : 다시 컴퓨터 언어로 변환하는 매서드임

  res.render('post-detail', {post:post})
})


//업데이트 링크를 눌렀을 때 업데이트 창을 띄우고 그곳에 수정할 데이터를 전달하는 부분
router.get('/posts/:id/edit', async function(req,res){
  const postId = req.params.id;
  const post = await db.getDb().collection('post').findOne({_id: new ObjectId(postId)},{ title: 1, summary: 1, body:1 })

     if (!post) {
      return res.status(404),render('404');
    }
  res.render('update-post', {post:post});
  });

// 업데이트 창에서 입력칸에 데이터를 입력하고 업데이트 버튼을 눌렀을 때 사이트에 입력된 데이터를 선택된 게시물 데이터에 전달하여 선택된 게시물을 업데이트 시키는 부분
router.post('/posts/:id/edit', async function(req,res){
  const postId = new ObjectId(req.params.id);  

  const result = await db.getDb()
  .collection('post')
  .updateOne(
    {_id: postId}, 
    {
      $set: {
        title: req.body.title,
        summary: req.body.summary,
        body: req.body.content,
        date: new Date()          // 버튼을 클릭하여 수정을 요청한 시간으로 선택된 게시물의 date 데이터를 업데이트 시킴
      }      
    } 
   );

  console.log(result);

  res.redirect('/posts');
})

// 게시물 삭제를 진행하는 부분
router.post('/posts/:id/delete',async function(req,res, next){  // next 미들웨어는 뭘까?
  let postId = req.params.id;

  try{
    postId = new ObjectId(postId);
  } catch(error) {
    return res.status(404).render('404');
    // return next(error);
  }

  const result = await db
    .getDb()
    .collection('post')
    .deleteOne({_id: postId});
    //await구문은 프로미스를 반환하기 때문에 그 문장에 에러가 발생해도 에러를
    // 잡을 수 없다고 함. 미리 배운 try, catch 구문을 활용하고, next라는 미들웨어를 사용하여 이를 해결하는
    // 방안이 있음.

  res.redirect('/posts')
})

module.exports = router;
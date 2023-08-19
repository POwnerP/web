const express = require('express');
const multer = require('multer'); //multer 요청

const db = require('../data/database');

const storageCongfig = multer.diskStorage({
  destination: function(req, file, cb){
    cb(null, 'images')// 파일이 저장되는 위치를 callback(회신)해줌.
  },
  //요청이 시작되면 req, file, callback의 값은 multer로 부터 전달받음.
  filename: function(req,file,cb){
    cb(null, Date.now() + '-' + file.originalname);
    // 요청으로부터 전달받은 file 객체의 original 속성에는 해당 파일의 기존 이름이 저장되어 있음.
    // 거기에 Date.now라는 매서드를 통해 이 문장이 실행될 때의 시간을 이름에 추가하여 데이터베이스에 저장되는 파일의 이름에 고유성을 줌.
  }
}); // 새로운 저장 객체를 생성하는 메서드임

const upload = multer({storage: storageCongfig}); //
//multer 함수 선언 
//{괄호 안에는 dest 속성을 통해 업로드 받는 파일을 저장할 곳의 주소를 넣어줄 수도 있음}
//{storage를 활용하면 파일의 저장 위치나 저장되는 파일의 확장자 등 저장할 데이터에 대한 설정을 더욱 구체적으로 할 수 있음.}
const router = express.Router();

router.get('/', async function(req, res) {
  const users = await db.getDb().collection('users').find().toArray();
  res.render('profiles', {users:users});
});

router.get('/new-user', function(req, res) {
  res.render('new-user');
});

router.post('/profiles', upload.single('image'), async function(req,res){ //괄호 안에는 무한히 미들웨어 함수를 넣을 수 있고, 작동 순서는 왼쪽부터 오른쪽임.
  //upload.single('image')은 미들웨어 함수이며 요청이 들어오면 그 요청을 분석하고 그 요청에 image 파일이 딸려오면 그 파일로의 접속을 주는 매서드임.하나의 파일을 업로드할 때 '.single'을 사용하고 ()안의 값은 파일을 업로드하는 input의 name 속성을 적으면 됨.
  const uploadedImageFile =  req.file; //req.body는 파일이 아닌 형태로의 접속을 가능하게 해주는 객체이고, req.file은 파일 형태로의 접속을 가능하게 해주는 객체임.
  const userData = req.body; //new-user 안의 전송되는 form 내부의 나머지 input 요소인 name = "username" 인풋이 저장됨.

  await db.getDb().collection('users').insertOne({
    name: userData.username,
    imagePath: uploadedImageFile.path //path 속성에는 파일이 저장된 경로가 저장되어 있음.
  })

  res.redirect('/');
})

module.exports = router;
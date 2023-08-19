// 노드와 몽고db 데이터베이스와 연결을 하기 위해 mongodb라는 패키지를 먼저 다운받았고,
// 이 패키지를 요청함.
const mongodb = require('mongodb');

// 패키지의 객체를 불러와서 선언함.
const MongoClient = mongodb.MongoClient;

let database;


async function connect() {
    //mongodb 패키지의 객체 속의 connect 매서드는 말그대로 매개변수의 링크에 해당되는 몽고db 서버르를 불러옴.
    //client 라는 객체에 불러온 서버를 할당함.
    const client = await MongoClient.connect('mongodb://localhost:27017');
    //그 중에서도 특정 데이터에이스를 db라는 매서드를 사용해 불러오고 database라는 변수에 할당함.
    database = client.db('blog');
}

// 데이터 베이스 연결이 설정되었는지 확인하는 함수 생성
function getDb() {
    if (!database) {
        throw { message: 'Database connection not established!'};
    }
    return database;
}

// 위에서 선언한, 몽고db 서버와 서버 속의 데이터베이스 연결 함수를 export함.
module.exports = {
    connectToDatabase: connect,
    getDb: getDb
};
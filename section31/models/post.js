const mongodb = require('mongodb');

const db = require('../data/database')

const ObjectId = mongodb.ObjectId;

//클래스는 객체를 만드는데 사용되는 틀임.
//여기서는 입력한 포스트를 객체로 받기위해 사용됨.
class Post{
    constructor(title, content, id) {
        this.title = title;
        this.content = content;
        
        if (id) {
            this.id = new ObjectId(id);
        }
    }

    //관련된 함수도 클래스 속에 선언.
    //1. 받은 포스트를 데이터베이스에 저장하는 함수.
    //2. 포스트를 업데이트하는 함수.
    //3. 포스트를 삭제하는 함수.
    async save() {
        let result;

        if(this.id){//요청으로부터 전달된 아이디가 있다면 이미 생성된 포스트이기때문에 업데이트를 진행함. 없다면 포스트를 생성하는 과정으로 넘어감.
            await db
                .getDb()
                .collection('posts')
                .updateOne(
                { _id: this.id },
                { $set: { title: this.title, content: this.content } }
                );
        } else {
            result = await db.getDb().collection('posts').insertOne({
                title: this.title,
                content: this.content,
            });
        }

        return result;
    }

    async delete() {
        if(!this.id) {
            return;
        }
        const result = await db.getDb().collection('posts').deleteOne({ _id: this.id });
        return result;
    }
}

module.exports = Post;
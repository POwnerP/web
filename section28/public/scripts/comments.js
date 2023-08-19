const loadCommentsBtnElement = document.getElementById('load-comments-btn');
const commentsSectionElement = document.getElementById('comments');
const commentsFormElement = document.querySelector('#comments-form form')
const commentTitleElement = document.getElementById('title');
const commentTextElement = document.getElementById('text');


function createCommentsList(comments) {
    const commentListElement = document.createElement('ol');

    for (const comment of comments) { // commnets가 배열이 아니라서 실행 안된다는데 콘솔 로그로 보면 배열 + 객체라고 나와있음..
        const commentElement = document.createElement('li');
        commentElement.innerHTML = `
        <article class="comment-item">
            <h2>${comment.title}</h2>
            <p>${comment.text}</p>
        </article>
        `;
        commentListElement.appendChild(commentElement);
    }
    return commentListElement;
}

//fetch를 사용하여 서버를 통해 요청하지 않고 사용자 측에서 요청을 보냄. = 자바스크립트를 통해 요청을 보냄. (Ajax)
async function fetchCommentsForPost(event) {
    const postId = loadCommentsBtnElement.dataset.postid; // 'data-'속성으로 추가한 속성은 dataset 객체에서 참조할 수 있음.
    //이벤트 객체 활용 -> const btn = event.target.dataset.postid;
    const response = await fetch(`/posts/${postId}/comments`);//fetch메서드는 기본적으로는 get요청을 보낸다.
    // 역 작은따옴표를 사용하면(``) 내부에 변수를 넣을 수 있다?
    // '/'는 절대경로 './'(생략가능)은 상대경로
    const responseData = await response.json();
    //fetch로 받게되는 값은(response변수) 요청에 대한 여러 값을 가지고 있는 객체임.
    // 그 중에 .json() 매서드는 blog.js에서 JSON 형태로 엔코딩된 응답을 다시 자바스크립트 형태로 바꿔줌.
    // .json() 매서드는 브라우저에서 제공하는 함수임.

    if(responseData || responseData.length > 0) { // 댓글이 없는 경우를 위한 if문, 댓글이 없을 때 링크를 누르면 링크는 사라지고 댓글도 안뜸.
        const commentsListElement = createCommentsList(responseData);
        commentsSectionElement.innerHTML ='';
        commentsSectionElement.appendChild(commentsListElement);
    } else {
        commentsSectionElement.firstElementChild.textContent = //p문의 내용을 바꾸는 부분.
        'We could not find any comments. Maybe add one?';
    }

    
}

async function saveComment(event) {
    event.preventDefault(); 
    //form은 제출되면 서버로 요청을 전송하는게 디폴트임. 
    //그러나 이 경우에는 서버로 요청하는 디폴트를 막아야하고 preventDefault()매서드는 말그대로 이 디폴트 작동을 없애줌.
    const postId = commentsFormElement.dataset.postid;

    const enteredTitle = commentTitleElement.value;
    const enteredText = commentTextElement.value;
    
    const comment = {title: enteredTitle, text:enteredText};

    
    try { //fetch 함수는 요청을 실패하면(아예 서버와 연결이 안되면 ex 데이터,와이파이 끊김) error을 throw함. 따라서
          // throw하는 것이 있는 경우를 다루는 try-catch구문을 활용하여 서버와 아예 연결이 안되는 경우를 대처함.
        const response = await fetch(`/posts/${postId}/comments`,{
            method: 'POST', // fetch매서드의 디폴트 요청 형태는 get이다. post로 바꾸려면 앞과 같이 쓰면 됨.
            body: JSON.stringify(comment), // JSON.stringify()는 자바스크립트코드를 JSON코드로 바꿔줌.
            headers:{ //요청의 header에(요청의 header는 Devconsole에 네트워크에서 볼 수 있음) 지금 보내는 요청의 데이터가 json 형태임을 알려줌.
                      //그렇지 않으면 요청의 데이터 형식이 없는 것으로 인식되어 app.use(express.json());에 의해 parse되지 않아 제대로 처리되지 않음. 데이터가 null로 전달됨.
                'Content-Type': 'application/json'
            }
        });
        
        if(response.ok){  // fetch의 결과로 받는 변수에는 ok 속성이 있음. 이것이 참이면 200,300 등 수신이 잘 되었음을 의미함. 거짓은 400, 500 등 클라이언트나 서버 오류를 의미함.
                          // 이를 이용하여 오류 발생 대비 동작을 명령함.
        fetchCommentsForPost(); 
        // 댓글을 확인하는 버튼을 눌렀을 때 작동되는 이벤트 리스너의 함수를 가져와서
        // 등록을 하는 순간 댓글창이 나타나도록 함.
        } else {
            alert('Could not send comment!');
        }

    } catch(error) {
        alert('Could not send request - maybe try again later!');
    }

}

loadCommentsBtnElement.addEventListener('click', fetchCommentsForPost);
commentsFormElement.addEventListener('submit', saveComment)
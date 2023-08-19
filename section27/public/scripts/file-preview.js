const filePickerElement = document.getElementById('image');
const imagePreviewElement = document.getElementById('image-preview');

function showPreview() {
    const files = filePickerElement.files;  // files 객체: input으로 받은 파일이 있다면 그 파일이 배열의 형태로 저장되어있는 객체
    if(!files || files.length === 0) {  //전달받은 파일이 없는 경우를 위한 부분
        imagePreviewElement.style.display = 'none';
        return;
    }

    const pickedFile = files[0]; // 배열의 형태로 input으로 받은 파일을 불러옴

    imagePreviewElement.src = URL.createObjectURL(pickedFile) 
    // 해당 파일은 아직 업로드 버튼을 누르지 않아 서버에 업로드 되지 않은 상태임. 따라서 사용자 컴퓨터 속에서 참조를 해와야 함.
    // URL.createObjectURL() 매서드는 괄호 안의 파일에 대한 로컬 URL을 만드는 매서드임.
    // URL.createObjectURL() 매서드를 통해, 사용자 컴퓨터에서, 사용자에 의해 선택된 사진으로 이동할 수 있는 URL을 만들어
    // 이를 <img>의 'src' 속성에 전달해 주어 화면에 선택된 이미지가 나오도록 함.
    imagePreviewElement.style.display = 'block'
}

filePickerElement.addEventListener('change', showPreview);
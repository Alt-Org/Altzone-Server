const mainImg = document.querySelector("#mainImg");

const imgPathBase = 'public/images/';
const mainImgPaths = ['catMeme1.jpg', 'catMeme2.png', 'catMeme3.jpg', 'catMeme4.jpg', 'catMeme5.jpg'];

//Get random mainImg each time the page download
const mainImgIndex = Math.floor(Math.random() * mainImgPaths.length);
mainImg.src = imgPathBase + mainImgPaths[mainImgIndex];
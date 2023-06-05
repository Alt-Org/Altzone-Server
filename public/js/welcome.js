const mainImg = document.querySelector("#mainImg");

const imgPathBase = 'public/images/';
const mainImgPaths = ['catMeme1.webp', 'catMeme2.webp', 'catMeme3.webp', 'catMeme4.webp', 'catMeme5.webp'];

//Get random mainImg each time the page download
const mainImgIndex = Math.floor(Math.random() * mainImgPaths.length);
mainImg.src = imgPathBase + mainImgPaths[mainImgIndex];
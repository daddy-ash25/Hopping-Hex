const noiseA = new Noise(); 
noiseA.seed(Math.random());
const noiseB = new Noise(); 
noiseB.seed(Math.random());

const canvas = document.querySelector('.canvas')
const canvasContainer = document.querySelector('.canvasContainer')
canvas.height = canvasContainer.clientHeight;
canvas.width = canvasContainer.clientWidth;

console.log(canvas);
let c = canvas.getContext('2d');
let gameStarted = false;

c.fillRect(200,20,20,20);
// console.log(canvasContainer);

if(!gameStarted){
    StartingPage()
}



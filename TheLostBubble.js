const noiseA = new Noise(); 
noiseA.seed(Math.random());
const noiseB = new Noise(); 
noiseB.seed(Math.random());

const canvas = document.querySelector('.canvas')
const canvasContainer = document.querySelector('.canvasContainer')
canvas.height = canvasContainer.clientHeight;
canvas.width = canvasContainer.clientWidth;

let parameters = {
    maxHeight: 40,
    minHeight: 0,
    octave2Height: 20,
    stretchToMin: 10,
    stretchToMax: 30,
    Octave1InputScale: 0.15,
    Octave2InputScale: 0.35,
    curveFactorInputScale: 0.05,
    get maxX(){
        return this.maxHeight*((this.maxHeight-this.stretchToMin)/(this.stretchToMax-this.stretchToMin));
    },
    get scale(){
        return this.maxHeight - this.stretchToMax;
    }
}

let mapData = {
    leftCrevis: [],
    rigthCrevis: [],
    dataNo: 0,
    curveFactorDataNo:0,
    Octaves: 2
}

const waveGenerator ={
    waveDataGenerator: function(noise, scale1, scale2, x){
        const n1factor = (parameters.maxHeight-parameters.minHeight)/2;
        const n2factor = parameters.octave2Height/2;
        const n1 = (noise.perlin2(x*scale1,0.5)*n1factor)+n1factor;
        const n2 = noise.perlin2(x*scale2,0.5)*n2factor;
        const baseWave = n1+n2
        // console.log(baseWave);
        const wave = waveNormaliseAndRescale(baseWave, parameters.stretchToMax, parameters.stretchToMin);
        console.log('scaled');
        console.log(wave);
        
        


        //function to normalise and rescale the data
        function waveNormaliseAndRescale(baseWave, high, low){
            //normalisation from 0 to 1
            baseWave = (baseWave - parameters.stretchToMin)/(parameters.stretchToMax-parameters.stretchToMin);

            //normalised*max to range
            baseWave = baseWave*parameters.maxHeight;
            console.log(baseWave);
            
            // squishing exiding data
            if(baseWave > high){
                // const maxX = parameters.maxHeight((parameters.maxHeight-parameters.stretchToMin)/(parameters.stretchToMax-parameters.stretchToMin));
                // const scale = parameters.maxHeight - parameters.minHeight;
                baseWave = parameters.stretchToMax + parameters.scale*(Math.log(1+(baseWave-parameters.stretchToMax))/Math.log(1+(parameters.maxX-parameters.stretchToMax)));
            }
            return baseWave;
        }
    }
}

console.log(canvas);
let c = canvas.getContext('2d');
let gameStarted = false;

c.fillRect(30,20,20,20);
// console.log(canvasContainer);

if(!gameStarted){
    StartingPageLoader()


    function StartingPageLoader(){
        for(mapData.dataNo = 0; mapData.dataNo<12; mapData.dataNo++){
            waveGenerator.waveDataGenerator(noiseA, parameters.Octave1InputScale,parameters.Octave2InputScale, mapData.dataNo);
        }
    }
}



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
    ExWaveRange: 20,
    Segments: 12,

    Octave1InputScale: 0.15,
    Octave2InputScale: 0.35,
    ExWaveInputScale: 0.05,
    get maxX() {
        return (this.maxHeight * ((this.maxHeight - this.stretchToMin) / (this.stretchToMax - this.stretchToMin)));
    },
    get scale() {
        // return (this.maxHeight - this.minHeight);
        return (this.maxHeight - this.stretchToMax);
    }
}

let mapData = {
    leftCrevis: [],
    rightCrevis: [],

    dataNo: 0,
    curveFactorDataNo: 0,
    Octaves: 2,

    prevousXLeft: 0,
    prevousXRight: 0,
    accumulatorLeft:0,
    accumulatorRight:0,
    minStep: 5,

    //linningData
    linningData: [],
    minWidth:2.5
}

let terrainData = {
    terrainCoordinatesLeft: [],
    terrainCoordinatesRight: [],
    DataNo: 0,
    IdNo:0,

    get yLength() {
        return 100 / parameters.Segments;
    }
};

const waveGenerator = {
    //thsi generates terrain points data
    waveDataGenerator: function (noise, scale1, scale2, x, isLeft) {
        const n1factor = (parameters.maxHeight - parameters.minHeight) / 2;
        const n2factor = parameters.octave2Height / 2;
        const n1 = (noise.perlin2(x * scale1, 0.5) * n1factor) + n1factor;
        const n2 = noise.perlin2(x * scale2, 0.5) * n2factor;
        const baseWave = n1 + n2;
        let wave = waveNormaliseAndRescale(baseWave, parameters.stretchToMax, parameters.stretchToMin);
        if (isLeft) {
            wave = ExtendedWave(wave, parameters.ExWaveInputScale, x, isLeft);
            let wave1 = shifter(wave,mapData.prevousXLeft,mapData.accumulatorLeft, x, isLeft);
            wave1 = Math.max(0, Math.min(100, wave1));
            mapData.leftCrevis.push(Math.floor(wave1));
        }
        else {
            wave = ExtendedWave(wave, parameters.ExWaveInputScale, x, isLeft);
            let wave1 = shifter(wave,mapData.prevousXRight,mapData.accumulatorRight,x, isLeft);
            wave1 = Math.max(0, Math.min(100, wave1));
            mapData.rightCrevis.push(Math.floor(100 - wave1));
        }


        function shifter( wave, prevWave, acc, count, isLeft){
            //if its the first no, just initialising then
            if(count == 0){
                if(isLeft)
                    mapData.prevousXLeft = wave;
                else
                    mapData.prevousXRight = wave;
                return wave;
            }

            //spacing out between two points so the terrain dosent look borring
            else{
                const diff = prevWave - wave;
                const sign = diff === 0 ? 1 : diff / Math.abs(diff);
                if(Math.abs(diff) < mapData.minStep){
                    const addableA = -(sign*(mapData.minStep - Math.abs(diff)));
                    const addableB = (sign*(Math.abs(diff)+mapData.minStep));
                    if(Math.abs(acc+addableA)<=Math.abs(acc+addableB)){
                        acc += addableA;
                        wave += addableA;
                    }
                    else{
                        acc += addableB;
                        wave += addableB;
                    }
                }
                if(isLeft){
                    mapData.accumulatorLeft = acc;
                    mapData.prevousXLeft = wave;
                }
                else{
                    mapData.accumulatorRight = acc;
                    mapData.prevousXRight = wave;
                }
                return wave;
            }
        }


        //function to normalise and rescale the data
        function waveNormaliseAndRescale(baseWave, high, low) {
            //normalisation from 0 to 1
            baseWave = (baseWave - parameters.stretchToMin) / (parameters.stretchToMax - parameters.stretchToMin);

            //normalised*max to range
            baseWave = baseWave * parameters.maxHeight;

            // squishing exiding data
            if (baseWave > high) {
                baseWave = parameters.stretchToMax + (parameters.scale * (Math.log(1 + (baseWave - parameters.stretchToMax)) / Math.log(1 + (parameters.maxX - parameters.stretchToMax))));
            }

            // return Math.max(0,baseWave);
            return baseWave;
        }


        //generating data which overlaps the middle
        function ExtendedWave(wave, scale, x) {
            let n = noiseA.perlin2(x * scale, 0.5);
            // console.log(n);
            n = (function (n) {
                return n * (parameters.ExWaveRange);
            })(n);
            n = Math.max(-(parameters.ExWaveRange / 2), Math.min((parameters.ExWaveRange / 2), n));
            // console.log(n);
            if (isLeft)
                return wave + n;
            else
                return wave - n;
        }
    },

    //this generates the terrain coordinates
    terrainDataGenerator: function (x, newX, y, IdNo, isLeft) {
        const newY = y + Math.abs(newX-x)*Math.sin(Math.PI/6)*(9/16);
        const node1 = { x: newX, y: newY, id: IdNo };
        const node2 = { x: newX, y: y+terrainData.yLength, id: IdNo+1};
        if(isLeft){
            
            terrainData.terrainCoordinatesLeft.push(node1);
            terrainData.terrainCoordinatesLeft.push(node2);        
        }
        else {
            terrainData.terrainCoordinatesRight.push(node1);       
            terrainData.terrainCoordinatesRight.push(node2);       
        }
    },

    //this generates the linning coordinates
    linningDataGenerator: function(number,isleft){
        let P = [];
        let point0;
        let point1;
        let point2;
        let point3;
        let point4;
        if(isleft){
            point0 = terrainData.terrainCoordinatesLeft[2*number-2];
            point1 = terrainData.terrainCoordinatesLeft[2*number-1];
            point2 = terrainData.terrainCoordinatesLeft[2*number];
            point3 = terrainData.terrainCoordinatesLeft[2*number+1];
            point4 = terrainData.terrainCoordinatesLeft[2*number+2];
        }
        else{
            point0 = terrainData.terrainCoordinatesRight[2*number-2];
            point1 = terrainData.terrainCoordinatesRight[2*number-1];
            point2 = terrainData.terrainCoordinatesRight[2*number];
            point3 = terrainData.terrainCoordinatesRight[2*number+1];
            point4 = terrainData.terrainCoordinatesRight[2*number+2];
        }
        // console.log(number);
        pFinder(point0,point1,point2,isleft);
        pFinder(point1,point2,point3,isleft);
        const linning1 = objMaker(P[0],point1,point2,P[1]);
        mapData.linningData.push(linning1);
        pFinder(point2,point3,point4,isleft);
        const linning2 = objMaker(P[1],point2,point3,P[2]);
        mapData.linningData.push(linning2);
        // console.log(P);
        mapData.linningData.push()
        

        function objMaker(p0,p1,p2,p3){
            const obj = {
                p0: {
                    x: p0.x,
                    y: p0.y,
                    localID: 0
                },
                p1: {
                    x: p1.x,
                    y: p1.y,
                    localID: 1
                },
                p2: {
                    x: p2.x,
                    y: p2.y,
                    localID: 2
                },
                p3: {
                    x: p3.x,
                    y: p3.y,
                    localID: 3
                }
            }
            return obj;
        }


        function pFinder(pA,pC,pB,isLeft){
            const p = getPerpendicularPoints(pA,pB,pC,(Math.random()+mapData.minWidth)/3)
            if((p.p1.x<pC.x)){
                if(isLeft){
                    P.push(p.p1);
                }
                else
                    P.push(p.p2);
            }
            else{
                if(isLeft){
                    P.push(p.p2);
                }
                else
                    P.push(p.p1);            
            }
        }   

        function getPerpendicularPoints(a, b, c, d) {
            // console.log(a);
            // console.log(c);
            // console.log(b);            
            const dx = b.x - a.x;
            const dy = b.y - a.y;
            const len = Math.hypot(dx, dy);

            const perp = {
                x: -dy / len,
                y: dx / len
            };

            const p1 = { x: c.x + perp.x * (d*16/9), y: c.y + perp.y * d };
            const p2 = { x: c.x - perp.x * (d*16/9), y: c.y - perp.y * d };

            return { p1, p2, perp };
        }
    }

}

let c = canvas.getContext('2d');
let gameStarted = false;


if (!gameStarted) {
    StartingPageLoader()


    function StartingPageLoader() {
        //seeding of the empty map data
        for (mapData.dataNo = 0; mapData.dataNo < parameters.Segments+3; mapData.dataNo++) {
            waveGenerator.waveDataGenerator(noiseA, parameters.Octave1InputScale, parameters.Octave2InputScale, mapData.dataNo, true);
            waveGenerator.waveDataGenerator(noiseB, parameters.Octave1InputScale, parameters.Octave2InputScale, mapData.dataNo, false);

        }

        //initial data seeding of the empty terrainCoordinates
        waveGenerator.terrainDataGenerator(mapData.leftCrevis[terrainData.DataNo], mapData.leftCrevis[terrainData.DataNo], 0, terrainData.DataNo, true);
        waveGenerator.terrainDataGenerator(mapData.rightCrevis[terrainData.DataNo], mapData.rightCrevis[terrainData.DataNo], 0, terrainData.DataNo, false);
        // console.log(terrainData.terrainCoordinatesLeft);   
        terrainData.IdNo += 2;
        terrainData.DataNo++;
        for (terrainData.DataNo; terrainData.DataNo < parameters.Segments+3; terrainData.DataNo++) {
            waveGenerator.terrainDataGenerator(mapData.leftCrevis[terrainData.DataNo-1], mapData.leftCrevis[terrainData.DataNo], terrainData.terrainCoordinatesLeft[terrainData.terrainCoordinatesLeft.length-1].y, terrainData.IdNo, true);
            waveGenerator.terrainDataGenerator(mapData.rightCrevis[terrainData.DataNo-1], mapData.rightCrevis[terrainData.DataNo], terrainData.terrainCoordinatesRight[terrainData.terrainCoordinatesRight.length-1].y, terrainData.IdNo, false);
            if(terrainData.DataNo>1){
                waveGenerator.linningDataGenerator(terrainData.DataNo-1,true);
                waveGenerator.linningDataGenerator(terrainData.DataNo-1,false);
        }
        terrainData.IdNo += 2;
        }
        console.log(terrainData.DataNo);
        
        
        
    }
}


for(let i = 0; i<5;i++){
    // pointAdder();
}
        console.log(terrainData.terrainCoordinatesLeft);
        console.log(terrainData.terrainCoordinatesRight);
        console.log(mapData.linningData);
        

//adds new point on the call
function pointAdder(){
    //getting new point
    waveGenerator.waveDataGenerator(noiseA, parameters.Octave1InputScale, parameters.Octave2InputScale, mapData.dataNo, true);
    waveGenerator.waveDataGenerator(noiseB, parameters.Octave1InputScale, parameters.Octave2InputScale, mapData.dataNo, false);
    mapData.dataNo++

    //generating points to get data
    waveGenerator.terrainDataGenerator(mapData.leftCrevis[terrainData.DataNo-1], mapData.leftCrevis[terrainData.DataNo], terrainData.terrainCoordinatesLeft[terrainData.terrainCoordinatesLeft.length-1].y, terrainData.IdNo, true);
    waveGenerator.terrainDataGenerator(mapData.rightCrevis[terrainData.DataNo-1], mapData.rightCrevis[terrainData.DataNo], terrainData.terrainCoordinatesRight[terrainData.terrainCoordinatesRight.length-1].y, terrainData.IdNo, false);
    terrainData.DataNo++;
    terrainData.IdNo += 2;
}

terrainGenerator();

function terrainGenerator(){
    //Getting the height and width of the canvs
    const W = canvas.width;
    const H = canvas.height;

    //getting the scale to plot the points
    const scaleX = W / 100;
    const scaleY = H / 100;
    console.log(W);
    console.log(H);
    terrainMaker(terrainData.terrainCoordinatesLeft,"black",true);
    terrainMaker(terrainData.terrainCoordinatesRight,"black",false);
    linningMaker(mapData.linningData,true);


    //generating the sides
    function terrainMaker(data,color,isLeft){
        c.strokeStyle = color;
        c.fillStyle='#1d2f3f';
        c.lineWidth = 1;
        c.beginPath();
        for(let i = 0; i<data.length;i++){
            const p = data[i];
            const x = p.x * scaleX;
            const y = (100-p.y) * scaleY;
            if(i==0)
                c.moveTo(x, y);
            else{
                c.lineTo(x, y);
            }
        }
        endingpoints(data,isLeft);
        c.fill();
        c.stroke();

        function endingpoints(data,isLeft){
            // const p = data[i];
            if(isLeft){
                c.lineTo(0,((100-data[data.length-1].y)*scaleY));
                c.lineTo(0,(100-data[0].y)*scaleY);
            }
            else{
                c.lineTo(100*scaleX,((100-data[data.length-1].y)*scaleY));
                c.lineTo(100*scaleX,(100-data[0].y)*scaleY);
            }
        }
    }

    function linningMaker(data, isleft) {
        for (let i = 0; i < data.length; i++) {
            c.beginPath();
            c.lineWidth = 1;
            c.fillStyle = getRandomColor();
            c.strokeStyle = 'black';

            // You can optionally sort keys like p0, p1, p2, p3 to ensure order
            const keys = Object.keys(data[i]).sort();

            for (let k of keys) {
                const point = data[i][k];
                const x = point.x * scaleX;
                const y = (100 - point.y) * scaleY;

                if (point.localID == 0) {
                    c.moveTo(x, y);
                } else {
                    c.lineTo(x, y);
                }
            }
            c.fill();
            // c.stroke();
        }
    }

    function getRandomColor() {
    const r = Math.floor(Math.random() * 256); // 0–255
    const g = Math.floor(Math.random() * 256); // 0–255
    const b = Math.floor(Math.random() * 256); // 0–255
    return `rgb(${r}, ${g}, ${b})`;
}

}
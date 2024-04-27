const canvas=document.getElementById("canvas");
canvas.width=240;

let rem=0;

const netCanvas=document.getElementById("network");
netCanvas.width=canvas.width*2;

const ctx = canvas.getContext("2d");
const netCtx = netCanvas.getContext("2d");

const road=new Road(canvas.width/2,canvas.width*0.9);

const n = 500;
const cars=generateCars(n);
let bestCar=cars[0];

if(localStorage.getItem("bestBrain")){
    console.log("Loaded!");
    console.log(localStorage.getItem("bestBrain"));
    for(let i=0;i<cars.length;i++){
        cars[i].brain=JSON.parse(localStorage.getItem("bestBrain"));
        if(i!=0){
            NeuralNetwork.mutate(cars[i].brain, 0.9);
        }
    }
}

const traffic=[
    new Car(road.getLaneCenter(1),-100,30,50,"DUMMY",2),
    new Car(road.getLaneCenter(0),-300,30,50,"DUMMY",2),
    new Car(road.getLaneCenter(2),-300,30,50,"DUMMY",2),
    new Car(road.getLaneCenter(0),-500,30,50,"DUMMY",2),
    new Car(road.getLaneCenter(1),-500,30,50,"DUMMY",2),
    new Car(road.getLaneCenter(1),-700,30,50,"DUMMY",2),
    new Car(road.getLaneCenter(2),-700,30,50,"DUMMY",2),
];

for(let i=0;i<100;i++){
    traffic.push(new Car(
        road.getLaneCenter(Math.floor(Math.random()*3)),
        -1000-i*120,
        30,
        50,
        "DUMMY",
        2
    ));
}

animate();

function save(){
    localStorage.setItem(
        "bestBrain",
        JSON.stringify(bestCar.brain));
        console.log("Saved!");
}

function discard(){
    localStorage.removeItem("bestBrain");
    console.log("Discarded!");
}

function generateCars(n){
    const cars=[];
    for(let i=1;i<=n;i++){
        cars.push(new Car(road.getLaneCenter(1), 100, 30, 50, "AI", 8));
    }
    return cars;
}

function animate(time){

    rem=0;
    for(let i=0;i<traffic.length;i++){
        traffic[i].update(road.borders, []);
    }

    for(let i=0;i<cars.length;i++){
        cars[i].update(road.borders, traffic);
    }

    bestCar=cars.find(
        c=>c.y==Math.min(
            ...cars.map(c=>c.y)
        ));

    canvas.height=window.innerHeight;
    netCanvas.height=window.innerHeight;

    ctx.save();
    ctx.translate(0,-bestCar.y+canvas.height*0.7);

    road.draw(ctx);

    for(let i=0;i<traffic.length;i++){
        traffic[i].draw(ctx, "red");
    }

    ctx.globalAlpha=0.2;

    for(let i=0;i<cars.length;i++){
        cars[i].draw(ctx, "blue");
    }

    ctx.globalAlpha=1
    bestCar.draw(ctx, "gold", true);

    ctx.restore();

    netCtx.lineDashOffset=-time/50;
    Visualizer.drawNetwork(netCtx, bestCar.brain);
    requestAnimationFrame(animate);

    if(bestCar.damaged){

        console.log("Best car is damaged!");
        setTimeout(()=>{
            if(bestCar.damaged){
                save();
                location.reload();
            }
        },1000);
    
    }

    for(let i=0;i<cars.length;i++){
        if(!cars[i].damaged){
            rem+=1;
        }
    }
    console.log("Remaining cars: "+rem);

}

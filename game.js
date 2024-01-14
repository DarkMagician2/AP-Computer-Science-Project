//Gets width and height of the window
let w = window.innerWidth;
let h = window.innerHeight;
let gamePause = true;
let escapePause = false;
let score = 0;
let lowQuality = false;
let scale = 500;
let scoreMult = 100;
//Function to generate a random hexadecimal of size length that isn't completely white
function genRanHex (size) {
    let hexArray = Array(size);
    return [...hexArray].map(() => Math.round(Math.random() * 15).toString(16)).join('');
}
//function to generate a random x and y that are in the spawning zones
const ranEnemySpawns = (info, coords) => {
    let outx = Math.round(Math.random()*(w-info.width));
    let outy = Math.round(Math.random()*(h-info.height));
    return ((outx>(w/8)-info.width&&outx<7*(w/8))&&(outy>(h/8)-info.height&&outy<7*(h/8))) ? ranEnemySpawns(info, coords) : coords.push(outx, outy);
}
//Entity Base: the default if no parameters are entered when creating an instance of the Entity class
const EB = {
    posType: "px",
    x: 0,
    y: 0,
    width: 50,
    height: 50,
    color: "#000000",
    name: "default",
    entity: ""
};
//Keybinds
let Key = {
pressed: {},
left: "a",
up: "w",
right: "d",
down: "s",
p: "p",
isDown: function (key){
    return this.pressed[key];
},
keydown: function (event){
    this.pressed[event.key] = true;
},
keyup: function (event){
    delete this.pressed[event.key];
}
};
//A Class to create an element and associated statistics, then store it in the instance
class Entity {
    //The constructor of the class, it's run when the instance is created
    constructor(obj){
        //Adds the Entity Base, and any arguments to the instance
        Object.assign(this, EB,  obj);
        //creating and appending the element to the page
        this.entity = document.createElement("div");
        document.body.appendChild(this.entity);
        //Setting the arguments
        this.entity.style.position = "absolute";
        this.entity.style.left = this.x+this.posType;
        this.entity.style.top = this.y+this.posType;
        this.entity.style.width = this.width+this.posType;
        this.entity.style.height = this.height+this.posType;
        this.entity.style.backgroundColor = this.color;
        this.entity.style.webkitUserSelect =  "none";
        this.entity.style.userSelect = "none";
        this.entity.innerHTML = this.name;
        
    }
    //A method which allows easy movement of the instance
    move(x, y){
        if(this.x+x<=w-this.width&&this.x+x>=0){
            this.x += x;
        } else if(this.x+x<0){
            this.x = 0;
        } else if(this.x+x>w-this.width){
            this.x = w-this.width;
        } else {
            this.x += 0;
        }
        if(this.y+y<=h-this.height&&this.y+y>=0){
            this.y += y;
        } else if(this.y+y<0){
            this.y = 0;
        } else if(this.y+y>h-this.height){
            this.y = h-this.height;
        } else {
            this.y += 0;
        }
        this.entity.style.left = this.x+this.posType;
        this.entity.style.top = this.y+this.posType;
    }
    //A method to move the instance to a specified location
    moveTo(x, y){
        this.x = (x<=w-this.width&&x>=0) ? x : 0;
        this.y = (y<=h-this.height&&y>=0) ? y : 0;
        this.entity.style.left = this.x+this.posType;
        this.entity.style.top = this.y+this.posType;
    }
    //A method to delete the instance or properties of the element
    delete(delay, property){
        setTimeout(()=>{
            if(property!="all"){
                this.entity.removeAttribute(property);
            } else {
                this.entity.remove();
                delete this;
            }
        },delay);
    }
    //A basic rectangle collision detector
    static isTouching(element1, element2){
        function touching(x1,y1,w1,h1,x2,y2,w2,h2){
            if(x2>w1+x1||x1>w2+x2||y2>h1+y1||y1>h2+y2){
                return false;
            } else {
                return true;
            }
        }
        return touching(element1.x,element1.y,element1.width,element1.height,element2.x,element2.y,element2.width,element2.height);
    }
}
//The unique arguments of the player entity
let player = {
    color: "#123456",
    name: ""
}
//changing color if low quality is enabled
if(lowQuality){
    player.color = "transparent";
}
//The arguments of the lasers
let laser = {
    width: 10,
    height: 10,
    color: "red",
    name: ""
}
//changing color if low quality is enabled
if(lowQuality){
    laser.color = "transparent";
}
//The unique arguments of the enemy entity
let enemy = {
    color: "transparent",
    name: ""
}
//The bounding area where enemies will not spawn, and also it explains info at the start
let noEnemy = {
    posType: "%",
    x: 12.5,
    y: 12.5,
    width: 75,
    height: 75,
    color: "#888888",
    name: ""
};
//Score counter
let scoreTxt = {
    color: "#ffffff",
    name: score
}
//Creating the player instance and bringing it to the front
const PLAYER = new Entity(player);
PLAYER.entity.style.zIndex = 1;
//Grabbing the player hitbox and other info
let playerInfo = PLAYER.entity.getBoundingClientRect();

//Creating the box where enemies cannot spawn
const NO_ENEMY = new Entity(noEnemy);
NO_ENEMY.entity.style.zIndex = 2;
//Providing information
const startGame = setInterval(()=>{
    NO_ENEMY.entity.innerHTML = "<h1 style='text-align: center;'>Welcome to My Shooter Game</h1><br><br><h2>Controls:</h2><br><h3>W is up, a is left, s is down, d is right, left click to shoot towards the mouse cursor, and escape is to pause. Your goal is to gain the highest score possible, to do that, shoot enemies. If an enemy touches you, the game will end. To enable low definition, press p now. To switch between easy mode, normal mode, hard mode, harder mode, or impossible mode, press h. Note: You earn less points in easy mode, and more in the harder difficulties. To exit this menu, press escape.</h3><br><h3>Current difficulty scaling: "+((scale==1000) ? "easy mode" : (scale==500) ? "normal mode" : (scale==400) ? "hard mode" : (scale==250) ? "harder mode" : "impossible mode")+"</h3>";
}, 20);
//Creating the scoreboard
const SCORE_BOX = new Entity(scoreTxt);
SCORE_BOX.entity.style.zIndex = 3;
SCORE_BOX.moveTo(w-SCORE_BOX.width, 0);
PLAYER.moveTo((w/2)-playerInfo.width, (h/2)-playerInfo.height);
//Tick counter
let tick=0;
//Key detecting
window.addEventListener("keyup", function(event) {
    Key.keyup(event);
});
window.addEventListener("keydown", function(event) {
    Key.keydown(event);
});
//Laser spawning
window.addEventListener("click", function(event) {
    if(!gamePause){
        //distance formula
        let mX = (event.clientX-(PLAYER.x+PLAYER.width/2))/Math.sqrt((event.clientX-(PLAYER.x+PLAYER.width/2))*(event.clientX-(PLAYER.x+PLAYER.width/2))+(event.clientY-(PLAYER.y+PLAYER.height/2))*(event.clientY-(PLAYER.y+PLAYER.height/2)));
        let mY = (event.clientY-(PLAYER.y+PLAYER.height/2))/Math.sqrt((event.clientX-(PLAYER.x+PLAYER.width/2))*(event.clientX-(PLAYER.x+PLAYER.width/2))+(event.clientY-(PLAYER.y+PLAYER.height/2))*(event.clientY-(PLAYER.y+PLAYER.height/2)));
        laser.x = PLAYER.x+PLAYER.width/2-laser.width/2;
        laser.y = PLAYER.y+PLAYER.height/2-laser.width/2;
        lasers.push(new Entity(laser), mX*20, mY*20);
    }
});
//Pause function
window.addEventListener("keydown", function(event) {
    if(!escapePause){
        if(event.key=="Escape"){
            if(gamePause){
                gamePause = false;
                NO_ENEMY.entity.style.display = "none";
                clearInterval(startGame);
            } else {
                gamePause = true;
            }
        }
    }
});
//Difficulty scaling
window.addEventListener("keydown", function(event) {
    if(gamePause){
        if(event.key=="h"){
            if(scale==1000){
                scale = 500;
                scoreMult = 100;
            } else if(scale==500){
                scale = 400;
                scoreMult = 125;
            } else if(scale==400){
                scale = 250;
                scoreMult = 200;
            } else if(scale==250){
                scale = 100;
                scoreMult = 500;
            } else {
                scale = 1000;
                scoreMult = 25;
            }
        }
    }
});
//Creating lists for storing enemies and lasers
let enemies = [];
let enemyCount = 0;
let lasers = [];
//Updating the screen
setInterval(()=>{
    //Low quality option
    if(Key.isDown(Key.p)){
        if(lowQuality){
            lowQuality = false;
        } else {
            lowQuality = true;
            PLAYER.entity.style.backgroundColor = "transparent";
            PLAYER.entity.innerHTML = "player";
            laser.color = "transparent";
            laser.name = "laser";
            enemy.color = "transparent";
        }
    }
    //Main section of logic
    if(!gamePause){
        //Score counter
        SCORE_BOX.entity.innerHTML = `Score: ${score}`;
        //Incrementing tick counter
        tick++;
        //Updating the bounds of the screen
        w = window.innerWidth;
        h = window.innerHeight;
        //Movement
        if(Key.isDown(Key.up)){
            PLAYER.move(0, -5);
        }
        if(Key.isDown(Key.left)){
            PLAYER.move(-5, 0);
        }
        if(Key.isDown(Key.down)){
            PLAYER.move(0, 5);
        }
        if(Key.isDown(Key.right)){
            PLAYER.move(5, 0);
        }
        //Game over
        for(let i=0;i<enemies.length;i++){
            let tempE = enemies[i];
            if(Entity.isTouching(PLAYER, tempE)){
                NO_ENEMY.entity.style.display = "inline";
                NO_ENEMY.entity.innerHTML = "<h1 style='text-align: center;'>Game Over<br>Score: "+score+"</h1>";
                escapePause = true;
                gamePause = true;
                PLAYER.entity.style.backgroundColor = "transparent";
                PLAYER.entity.innerHTML = "";
                for(let j=0;j<lasers.length;j++){
                    if(lasers[j]=="[object Object]"){
                        lasers[j].delete(0, "all");
                    }
                }
                lasers.splice(0, lasers.length);
                for(let j=0;j<enemies.length;j++){
                    enemies[j].delete(0, "all");
                }
                enemies.splice(0, enemies.length);
            }
        }
        //Laser collision and logic
        for(let i=0;i<lasers.length;i++){
            if(lasers[i]=="[object Object]"){
                //Delete if it reaches the edge of the screen
                if((lasers[i].x>=w-lasers[i].width-40||lasers[i].x<=40)||(lasers[i].y>=h-lasers[i].height-40||lasers[i].y<=40)){
                    lasers[i].delete(0, "all");
                    lasers.splice(i, 1);
                }
                //Detect if lasers hit enemies
                if(lasers[i]=="[object Object]"){
                    for(let j=0;j<enemies.length;j++){
                        let tempL = lasers[i];
                        let tempE = enemies[j];
                        if(Entity.isTouching(tempL, tempE)){
                            if(lasers[i]=="[object Object]"){
                                lasers[i].delete(0, "all");
                                lasers.splice(i, 1);
                                enemies[j].delete(0, "all");
                                enemies.splice(j, 1);
                                score += scoreMult;
                            }
                        }

                    }
                    //Laser movement
                    if(lasers[i]=="[object Object]"){
                        lasers[i].move(lasers[i+1], lasers[i+2]);
                    }
                }
            }
        }
        let difficulty = Math.round(1+tick/scale);
        if(difficulty>200){
            difficulty = 200;
        }
        //Spawning an enemy at increasing intervals
        if(tick%Math.round(200/difficulty)==0){
            enemies.push(new Entity(enemy));
            let cooords = [];
            enemyCount = enemies.length-1;
            if(enemies.length>0){
                //Random enemy location in a valid spawn area
                ranEnemySpawns(playerInfo, cooords);
                enemies[enemyCount].moveTo(cooords[0], cooords[1]);
                //Changing color if low quality is enabled
                if(!lowQuality){
                    enemies[enemyCount].entity.style.backgroundColor = "#"+genRanHex(6);
                } else {
                    enemies[enemyCount].entity.innerHTML = "enemy";
                }
                //Keeping track of enemies
                enemyCount++;
            }
            
        }
        //Move enemies towards player
        if(enemies.length>0){
            for(let i in enemies){
                if(enemies[i].x<PLAYER.x){
                    enemies[i].move(2*(1+difficulty/20), 0);
                } else if(enemies[i].x>PLAYER.x){
                    enemies[i].move(-2*(1+difficulty/20), 0);
                }
                if(enemies[i].y<PLAYER.y){
                    enemies[i].move(0, 2*(1+difficulty/20));
                } else if(enemies[i].y>PLAYER.y){
                    enemies[i].move(0, -2*(1+difficulty/20));
                }
            }
        }
    }
//Loops every 20 milliseconds
},20);

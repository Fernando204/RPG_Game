const socket = io('http://localhost:3034');
const personagens = ["aramis.png","geno.png","kathe.png","calisto.png","borg.png","julian.png"]
const entrada = document.getElementById('entry');
const jogo = document.getElementById('game');
const PlayersButtons = document.querySelectorAll('.PlayerBT');
const aceleração = -3 * (10 ** (-3));

let player1;
let currentBottom;
let indexP = 0;
let timer = 200;
let lastBTmoveTime = 0;
let posX = 420;//delimitara até onde o personagem cairá
let posY = 10;
let atqB = true;
let salto = true;
let ingame = false;//variavel para indicar se está na area de jogo
let velocidade = 200;
let time = Date.now();

let PlayerInfo = {
    Identify: 0,
    index: 0,
    name: " ",
    YPosition: 0,
    XPosition: 0,
    Life: 100,
};



const getPlayerBottom = ()=>{
    if (!player1) {
        return 0;
        console.error('player não definido');
    }
    const {bottom} = getComputedStyle(player1);
    const bottomNumber = +bottom.replace('px','');
    console.log("posição atual: "+ bottomNumber);
    return bottomNumber;
}

const FinalPos = (S0, v, t)=>{
    const retorno =  S0 + v * t + 0.5 * aceleração * (t**2);
    console.log("retorno:  "+ retorno);
    return retorno;
}
const createGravity = ()=>{
    
         let gravidade = setInterval(()=>{
        const currentTime = Date.now();
        const timeGap = currentTime - time;
        time = currentTime;

        const bottom = getPlayerBottom();

        const newPos = FinalPos(bottom,velocidade, timeGap);
    
        velocidade += aceleração * timeGap;
        console.log('nova posição: '+newPos);

        if (newPos >= posX) {
            player1.style.bottom = `${newPos}px`;   
        } else {
            velocidade = 0;
        }
    
    },1);
    
   
}; createGravity();


const testes = (algo)=>{
    const {bottom} = getComputedStyle(player1);
    document.getElementById('devTest').innerHTML = `X: ${posY}, y:${bottom}, ${algo}`;
    //essa função é chamada nas funções de movimento e de salto
}

PlayersButtons.forEach((button, index)=>{
    button.addEventListener('click',()=>{
        PlayersButtons[indexP].style.border = '5px solid black';
        indexP = index;
        button.style.border = '5px solid red';
    })
})

const entrar = ()=>{//função para ir para o cenario do jogo
    ingame = true;
    var person = document.createElement("img");
    person.classList.add('players');
    person.src = personagens[indexP];//adiciona o personagem de acordo com seu indice
    document.body.appendChild(person);
    
    player1 = person;
    entrada.style.display = "none";
    jogo.style.display = "flex";

    requestAnimationFrame(atualizarPlayerPos);

    io.emit('playerEntryInGame', PlayerInfo);
}

const ataqueBasico = ()=>{
    if (indexP === 1 && atqB) {
        atqB = false;
        var bala = document.createElement('div');
        bala.classList.add('Gbala');
        bala.style.marginLeft = posY+'px';
        bala.style.bottom = (getPlayerBottom()+30)+'px';
        document.body.appendChild(bala);
        setTimeout(()=>{
            bala.style.marginLeft = (posY - 900)+'px';
        },1)
        setTimeout(()=>{
            document.body.removeChild(bala);
        },510)
        
    }
}

const gamepadConected = ()=>{
    startGamepadLoop();
}

//configuração do gamepad
const startGamepadLoop = ()=>{
        const readGamepadInput = ()=>{

            if (posY>= 940 || posY <= -930) {
                posX = -80;
            }
            if(posY < 930 && getPlayerBottom()>=420 && posY > -920 && getPlayerBottom()>=420){
                posX = 420;
            }
            if(posY < 630 && getPlayerBottom()>=635 && posY > -620 && getPlayerBottom()>=635){
                posX = 635;
            }
            if (getPlayerBottom() < 0) {
                entrada.style.display = 'flex';
                jogo.style.display = 'none'
                ingame = false;
                document.body.removeChild(player1);
                posX = 420;
                posY = 0;

            }

            const gamepads = navigator.getGamepads();

            if (gamepads[0]) {
                const gamepad = gamepads[0];
                const timeNow = Date.now();

                const [leftX, leftY] = gamepad.axes; // Analógico esquerdo

                if (ingame) {
                    if(Math.abs(leftX) < 0.1){
                 
                     } else if(leftX < 0){
                        posY -= 20;
                        player1.style.transform = 'rotateY(0deg)';

            
                        testes()
                    } else if (leftX > 0) {
                        posY += 20;
                        player1.style.transform = 'rotateY(180deg)';
                        testes()
                    } 

                    
                    if(gamepad.buttons[0].pressed){ // para fazer o personagem pular
                        if (salto) {
                            currentBottom = getPlayerBottom();
                            salto = false;
                        }
                        
                        setTimeout(()=>{
                            if (getPlayerBottom() < (currentBottom + 250)) {
                                player1.style.bottom = (getPlayerBottom()+30)+'px';
                                testes();
                            }
                        },10)
                            
                    } else {
                        salto = true;
                        testes('salto = true');
                    }

                    if (gamepad.buttons[7].pressed) {
                        ataqueBasico();
                    } else{
                        atqB = true;
                    }

                } else if(timeNow - lastBTmoveTime > timer) {
                    if(gamepad.buttons[14].pressed){
                        if (indexP >= 1) {
                            
                            indexP--;
                            PlayersButtons[indexP].style.border = '5px solid red';
                            PlayersButtons[indexP+1].style.border = '5px solid black';
                           lastBTmoveTime = timeNow;
                           
                        }
                    }
                    if(gamepad.buttons[15].pressed){
                        if (indexP < PlayersButtons.length - 1) {
                            
                            indexP++;
                            PlayersButtons[indexP].style.border = '5px solid red';
                            PlayersButtons[indexP-1].style.border = '5px solid black';
                            lastBTmoveTime = timeNow;
                             
                           
                        }
                    }
                    if(gamepad.buttons[9].pressed){
                        entrar();
                    }
                }
                

                
            }

        requestAnimationFrame(readGamepadInput);
    }

    readGamepadInput();

};

window.addEventListener('gamepadconnected',gamepadConected);

document.body.addEventListener('keydown',(e)=>{
    if (ingame) {
        switch(e.key){
            case 'a':
                posY -= 20;
                break;
            case 'd':
                posY += 20;
                break;
        }
        
    }
})

const atualizarPlayerPos = ()=>{
    player1.style.marginLeft = posY+'px';
    requestAnimationFrame(atualizarPlayerPos);
}

//recebimentos do back-end:
io.on('PlayerID',(msg)=>{
    PlayerInfo.Identify = PlayerInfo.Identify !== 0 ? msg : PlayerInfo.Identify;
    alert(`player ${PlayerInfo.Identify} conectado`);
})
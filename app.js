const express = require('express');
const http = require('http');
const socketIO = require('socket.io')
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

let PlayersAmount = 0;

app.use(express.static(path.join(__dirname,'public')));

io.on('connection',(socket)=>{
    console.log('jogador conectado  '+PlayersAmount);
    
    socket.on('playerEntryInGame',()=>{
        PlayersAmount++;
        socket.emit('PlayerID',PlayersAmount);
        console.log('foi')
    })
})


server.listen(3034,()=>{
    console.log('server ligado na porta http://localhost:3034');
});
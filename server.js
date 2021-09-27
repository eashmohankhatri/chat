const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

const io = require('socket.io')(server);
let connectedPeers = [];

// const { v4: uuidV4 } = require('uuid');

// app.set('view engine', 'ejs');
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + `/public/index.html`)
});

// app.get('/:room', (req, res) => {
//     res.render('room', { roomId: req.params.room });
// });

server.listen(PORT, () => {
    console.log(`listening on port: ${PORT}`)
});

io.on('connection', (socket) => {
    console.log("user connected to socketio server", socket.id);

    connectedPeers.push(socket.id);
    console.log(connectedPeers);

    socket.on('pre-offer', (preOfferData) => {

        const { callType, colleePersonalCode } = preOfferData;

        //verify if the pre-offer request is for a valid connected user
        const connectedPeer = connectedPeers.filter((peerSocketId) =>
            peerSocketId === colleePersonalCode
        );

        //If the pre-offer is valid then we also need to send the pre-offer
        //to callee
        if (connectedPeer.length > 0) {
            const data = {
                callType,
                callerSocketId: socket.id
            }

            io.to(colleePersonalCode).emit('pre-offer', data);
            console.log("valid callee code", data);
            console.log("connectedPeer", connectedPeer);

        } else {
            console.log("invalid callee code");
            const data = {
                preOfferAnswer: 'CALLEE_NOT_FOUND'
            }
            io.to(socket.id).emit('pre-offer-answer', data);
        }

    });

    socket.on('pre-offer-answer', (data) => {
        console.log('pre-offer-answer came:', data);
        const { callerSocketId } = data;

        //verify if the pre-offer request is for a valid connected user
        const connectedPeer = connectedPeers.filter((peerSocketId) =>
            peerSocketId == callerSocketId
        );

        //If the pre-offer is valid then we also need to send the pre-offer answer
        //to caller
        if (connectedPeer) {
            io.to(callerSocketId).emit('pre-offer-answer', data);
        }
    });

    socket.on('webRTC-signaling', (data) => {
        console.log("server socket get webRTC-signaling", data);

        const { connectedUserSocketId } = data;

        //verify if the signaling request is for a valid connected user
        const connectedPeer = connectedPeers.filter((peerSocketId) =>
            peerSocketId == connectedUserSocketId
        );

        console.log("connectedUserSocketId", connectedUserSocketId);
        if (connectedPeer) {
            console.log("connectedUserSocketId", connectedUserSocketId);
            io.to(connectedUserSocketId).emit('webRTC-signaling', data);
        }

    });

    socket.on('disconnect', () => {
        console.log('user disconnected', socket.id);

        const newConnectedPeers = connectedPeers.filter((peerSocketId) =>
            peerSocketId != socket.id
        );

        connectedPeers = newConnectedPeers;

        console.log(connectedPeers);
    });
});

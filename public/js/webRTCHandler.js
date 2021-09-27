import * as wss from './wss.js';
import * as constants from './constants.js';
import * as ui from './ui.js';
import * as store from './store.js';

let connectedUserDetails;
let peerConnection;
const defaultConstraints = {
    audio: true,
    video: true
};

const configuration = {
    iceServers: [
        { urls: 'stun:stun1.google.com:13902' }
    ]
};

export const getLocalPreview = () => {
    navigator.mediaDevices.getUserMedia(defaultConstraints).
        then((stream) => {
            ui.updateLocalStream(stream);
            store.setLocalStream(stream);
        }).
        catch(err => {
            console.log("err while connecting local:", err)
        });
}

const createPeerConnection = () => {
    peerConnection = new RTCPeerConnection(configuration);
    peerConnection.onicecandidate = (event) => {
        console.log('getting ice candidate from stun server');
        if (event.candidate) {
            //send our ice candidate to other peer
            wss.sendDataUsingWebRTCSignaling({
                connectedUserSocketId: connectedUserDetails.socketId,
                type: constants.webRTCSignaling.ICE_CANDIDATE,
                candidate: event.candidate
            });
        }
    }


    peerConnection.onconnectionstatechange = () => {
        if (peerConnection.connectionState == 'connected') {
            console.log("successfully connected with another peer!");
        }
    };

    //receiving tracks
    const remoteStream = new MediaStream();
    store.setRemoteStream(remoteStream);
    ui.updateRemoteVideo(remoteStream);

    peerConnection.ontrack = (event) => {
        remoteStream.addTrack(event.track);
    }

    //add out stream to peer connection
    if (connectedUserDetails.callType === constants.callType.VIDEO_PERSONAL_CODE) {
        const localStream = store.getState().localStream;

        for (const track of localStream.getTracks()) {
            peerConnection.addTrack(track, localStream);
        }
    }
};

export const sendPreOffer = (callType, colleePersonalCode) => {

    connectedUserDetails = { socketId: colleePersonalCode, callType }

    if (callType == constants.callType.CHAT_PERSONAL_CODE ||
        callType == constants.callType.VIDEO_PERSONAL_CODE) {
        const data = {
            callType,
            colleePersonalCode
        }
        ui.showCallingDialog(callingDialogRejectCallHandler);
        wss.sendPreOffer(data);
    }

};


export const handlePreOffer = (data) => {
    const { callType, callerSocketId } = data;
    connectedUserDetails = { socketId: callerSocketId, callType }

    if (callType == constants.callType.CHAT_PERSONAL_CODE ||
        callType == constants.callType.VIDEO_PERSONAL_CODE) {
        ui.showIncomingCall(callType, acceptCallHandler, rejectCallHandler)
    }
};

export const handlePreOfferAnswer = (data) => {
    const { preOfferAnswer } = data;
    ui.removeAllDialog();
    console.log("preoffer answer came:", data);

    if (preOfferAnswer === constants.preOfferAnswer.CALLEE_NOT_FOUND) {
        //Show dialog callee not found    
        ui.showInfoDialog(preOfferAnswer);
    } else if (preOfferAnswer === constants.preOfferAnswer.CALL_REJECTED) {
        //Show dialog call rejected
        ui.showInfoDialog(preOfferAnswer);
    } else if (preOfferAnswer === constants.preOfferAnswer.CALL_UNAVAILABLE) {
        //Show dialog call unavailable
        ui.showInfoDialog(preOfferAnswer);
    } else if (preOfferAnswer === constants.preOfferAnswer.CALL_ACCEPTED) {
        console.log("peer accepted the connection");
        ui.showCallElements(connectedUserDetails.callType);
        createPeerConnection();
        //send webRTC offer
        sendWebRTCOffer();
    }


};

const acceptCallHandler = () => {
    console.log("call accepted");
    createPeerConnection();
    sendPreOfferAnswer(constants.preOfferAnswer.CALL_ACCEPTED);
    ui.showCallElements(connectedUserDetails.callType);
}

const rejectCallHandler = () => {
    console.log("call rejected");
    sendPreOfferAnswer(constants.preOfferAnswer.CALL_REJECTED);
}

const callingDialogRejectCallHandler = () => {
    console.log("caller rejected teh call");
}

const sendPreOfferAnswer = (preOfferAnswer) => {
    const data = {
        callerSocketId: connectedUserDetails.socketId,
        preOfferAnswer
    }

    ui.removeAllDialog();
    wss.sendPreOfferAnswer(data);
};

export const sendWebRTCOffer = async () => {
    console.log("inside sendWebRTCOffer function");
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    wss.sendDataUsingWebRTCSignaling({
        connectedUserSocketId: connectedUserDetails.socketId,
        type: constants.webRTCSignaling.OFFER,
        offer: offer
    });
}

export const handleWebRTCOffer = async (data) => {
    // console.log('webrtc offer came', data);

    await peerConnection.setRemoteDescription(data.offer);
    const answer = await peerConnection.createAnswer();
    wss.sendDataUsingWebRTCSignaling({
        connectedUserSocketId: connectedUserDetails.socketId,
        type: constants.webRTCSignaling.ANSWER,
        answer: answer
    });
}

export const handleWebRTCAnswer = async (data) => {
    console.log("got webrtc answer: handleWebRTCAnswer: ", data);
    await peerConnection.setRemoteDescription(data.answer);
};

export const handleWebRTCCandidate = async (data) => {
    console.log("handleWebRTCCandidate", data);
    try {
        await peerConnection.addIceCandidate(data.candidate);
    } catch (err) {
        console.log("error on receiving ice candidate, handleWebRTCCandidate", err);
    }
};
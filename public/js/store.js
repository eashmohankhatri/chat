let state = {
    socketId: null,
    localStream: null,
    remoteStream: null,
    screenSharingStream: null,
    allowConnectionsFromStrangers: false,
    screenSharingActive: false
};

export const setSocketId = (socketId) => {
    state = { ...state, socketId: socketId }
    console.log("setting socketId", socketId);
}

export const setLocalStream = (localStream) => {
    state = { ...state, localStream: localStream }
}

export const setRemoteStream = (remoteStream) => {
    state = { ...state, remoteStream: remoteStream }
}

export const setScreenSharingStream = (screenSharingStream) => {
    state = { ...state, screenSharingStream: screenSharingStream }
}
export const setAllowConnectionsFromStrangers = (allowConnectionsFromStrangers) => {
    state = { ...state, allowConnectionsFromStrangers: allowConnectionsFromStrangers }
}

export const setScreenSharingActive = (screenSharingActive) => {
    state = { ...state, screenSharingActive: screenSharingActive }
}

export const getState = () => {
    return state;
}
import * as constants from './constants.js';
import * as elements from './elements.js';

export const updatePersonalCode = (personalCode) => {
    const personalCodeParagraph = document.getElementById('personal_code_paragraph');
    personalCodeParagraph.innerHTML = personalCode;
}

//Show dialog to the callee on incoming call
export const showIncomingCall = (callType, acceptCallHandler, rejectCallHandler) => {
    const callTypeInfo = (callType === constants.callType.CHAT_PERSONAL_CODE) ? 'Chat' : 'Video';

    const incomingCallDialog = elements.getIncomingCallDialog(callTypeInfo, acceptCallHandler, rejectCallHandler);
    const dialog = document.getElementById('dialog');
    //remove existing elements
    dialog.querySelectorAll('*').forEach((dialog) => dialog.remove());

    //add dialog
    dialog.appendChild(incomingCallDialog);
}

//Show dialog to the caller
export const showCallingDialog = (rejectCallHandler) => {
    const callingDialog = elements.getCallingDialog(rejectCallHandler);
    // const dialog = document.getElementById('dialog');
    // //remove existing elements
    // dialog.querySelectorAll('*').forEach((dialog) => dialog.remove());

    removeAllDialog();

    //add dialog
    dialog.appendChild(callingDialog);
}


export const removeAllDialog = () => {
    const dialog = document.getElementById('dialog');
    //remove existing elements
    dialog.querySelectorAll('*').forEach((dialog) => dialog.remove());
}

export const showInfoDialog = (preOfferAnswer) => {
    let infoDialog = null;

    if (preOfferAnswer === constants.preOfferAnswer.CALLEE_NOT_FOUND) {
        //Show dialog callee not found    
        infoDialog = elements.getInfoDialog('Call Not Found', 'Callee not found. Please check personal code!');

    } else if (preOfferAnswer === constants.preOfferAnswer.CALL_REJECTED) {
        //Show dialog call rejected
        infoDialog = elements.getInfoDialog('Call Rejected', 'Callee rejected the call');
    } else if (preOfferAnswer === constants.preOfferAnswer.CALL_UNAVAILABLE) {
        //Show dialog call unavailable
        infoDialog = elements.getInfoDialog('Call unavailable', 'Callee is busy');
    }

    if (infoDialog) {
        const dialog = document.getElementById('dialog');
        removeAllDialog();

        //add dialog
        dialog.appendChild(infoDialog);

        setTimeout(() => { removeAllDialog(); }, [4000]);
    }

}

export const showCallElements = (callType) => {
    console.log("showing call elements", callType);
    if (callType == constants.callType.CHAT_PERSONAL_CODE) {
        showChatCallElements();
    }
    if (callType == constants.callType.VIDEO_PERSONAL_CODE) {
        showVideoCallElements();
    }
}

const showChatCallElements = () => {
    const finishConnectionChatButtonContainer = document.getElementById(
        'finish_chat_button_container');

    showElement(finishConnectionChatButtonContainer);
    const newMessageInput = document.getElementById('new_messages_container');
    showElement(newMessageInput);
    disableDashboard();

}
const showVideoCallElements = () => {
    console.log("showing video container");
    const callButtons = document.getElementById('call_buttons');
    showElement(callButtons);

    const placeHolder = document.getElementById('video_placeholder');
    hideElement(placeHolder);

    const remoteVideo = document.getElementById('remote_video');
    showElement(remoteVideo);

    const newMessageInput = document.getElementById('new_messages_container');
    showElement(newMessageInput);
    disableDashboard();
}

export const updateLocalStream = (stream) => {
    const localVideo = document.getElementById('local_video');
    localVideo.srcObject = stream;
};

export const updateRemoteVideo = (stream) => {
    console.log("******=========>>updating remote video now: updateRemoteVideo");
    const remoteVideo = document.getElementById('remote_video');
    remoteVideo.srcObject = stream;

    remoteVideo.addEventListener('loadedmetadata', () => {
        localVideo.play();
    });
};

//ui helpers
const enableDashboard = () => {
    const dashboardBlocker = document.getElementById('dashboard_blur');
    if (!dashboardBlocker.classList.contains('display_none')) {
        dashboardBlocker.classList.add('display_none')
    }
}

const disableDashboard = () => {
    const dashboardBlocker = document.getElementById('dashboard_blur');
    if (dashboardBlocker.classList.contains('display_none')) {
        dashboardBlocker.classList.remove('display_none');
    }
}

const hideElement = (element) => {
    if (!element.classList.contains('display_none')) {
        element.classList.add('display_none')
    }
}

const showElement = (element) => {
    if (element.classList.contains('display_none')) {
        element.classList.remove('display_none')
    }
}


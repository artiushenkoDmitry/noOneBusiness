var video;
var recordedVideo;
var myPeerConnection;
var remotePeerConnection;
var PeerConnection;
var theirVideo;
var mediaRecorder;
var recordedBlobs;
var superBuffer;
var remoteStream;
//var currentDataArray = [];
//var localStream;
// var SessionDescription;

const description = {
    offerToReceiveAudio: 1,
    offerToReceiveVideo: 1
    // voiceActivityDetection: false
};
navigator.getMedia = navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia ||
    navigator.msGetUserMedia;

PeerConnection = window.RTCPeerConnection ||
    window.mozRTCPeerConnection;

function getReceiverStats() {
    const receiver = remotePeerConnection.getReceivers()[1];
    receiver.getStats().then(res => {
        res.forEach(report => {
            console.log('report');
            console.log(report);
        });
    });
}

function pageReady() {
    theirVideo = document.getElementById('theirVideo');
    video = document.getElementById('video');
    recordedVideo = document.getElementById('recordedVideo');
    // for (index = 0; index < 10; index++) {
    //     blobs[index] = new Blob();
    // }
}

function runPromise() {
    navigator.getMedia({
        video: true,
        audio: true
    }, function (stream) {
//        localStream = stream;
        video.srcObject = stream;
        createPeerConnection(stream);
    }, function (error) {
    })
}

//Success! Show the remote video...
function gotRemoteStream(event) {
    remoteStream = event.streams[0];
    console.log('связь с удаленным пиром установлена');
    //    startRecording();
    //    playRecord();
    //    window.stream = event.streams[0];
    theirVideo.srcObject = remoteStream;
};

function startRecording() {
    recordedBlobs = [];
    console.log('вошли в функцию startRecording');
    let options = { mimeType: 'video/webm;codecs=vp9' };
    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        console.log(options.mimeType, ' не поддерживается');
    } else {
        try {
            mediaRecorder = new MediaRecorder(remoteStream, options);
        } catch (error) {
            console.error('Произошла ошибка при создании MediaRecorder:', error);
            return;
        }
        console.log('Создан MediaRecorder ', mediaRecorder, ' с настройками ', options);

        mediaRecorder.ondataavailable = handleDataAvailable;
        mediaRecorder.start(100);
        console.log('MediaRecorder started', mediaRecorder);
    }
}

function handleDataAvailable(event) {
    console.log('вошли в метод handleDataAvailable');
    if (event.data && event.data.size > 0) {
        recordedBlobs.push(event.data);
        // currentDataArray.push(event.data);
        // blobs[0] = new Blob(currentDataArray, { type: 'video/webm' });
        // console.log('blobs[0].size', blobs[0].size);
        // if (blobs[0].size >= 262144) {       //256 Кб
        //     currentDataArray = [];
        //     playBlobs(blobs[0]);
        // }
    }
}

// function playBlobs(blob) {
//     recordedVideo.src = window.URL.createObjectURL(blob);
// }

function playRecord() {
//    superBuffer = new Blob(recordedBlobs, { type: 'video/webm' });
    theirVideo.srcObject = null;
    //    theirVideo.src = window.URL.createObjectURL(superBuffer);
    theirVideo.src = window.URL.createObjectURL(superBuffer);
}

function stopRecording() {
    if (mediaRecorder && mediaRecorder.state == 'recording') {
        mediaRecorder.stop(); 
        superBuffer = new Blob(recordedBlobs, { type: 'video/webm' });
    }
}

function downloadFile() {
//    superBuffer = new Blob(recordedBlobs, { type: 'video/webm' });
    const url = window.URL.createObjectURL(superBuffer);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = 'test.webm';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }, 100);
}

function end() {
    console.log('end')
//    localStream.getTracks().forEach(track => track.stop());
    theirVideo.srcObject = null;
    myPeerConnection.close();
    remotePeerConnection.close();
    myPeerConnection = null;
    remotePeerConnection = null;
}

///////////////////////////////////////////////
function createPeerConnection(stream) {
    myPeerConnection = new PeerConnection(null);
    remotePeerConnection = new PeerConnection(null);

    myPeerConnection.onicecandidate = gotMyIceCandidate;
    remotePeerConnection.onicecandidate = gotRemoteIceCandidate;

    myPeerConnection.addStream(stream);
    remotePeerConnection.ontrack = gotRemoteStream;


    myPeerConnection.createOffer(description)
        .then(gotLocalDescription)
        .catch(() => { console.log('Создать локальный оффер не получилось') });
};

function gotMyIceCandidate(event) {
    if (event.candidate) {
        remotePeerConnection.addIceCandidate(event.candidate)
            .then(() => {
            })
            .catch(() => console.log('Получен мой кандидат, но выслать не получилось'));
    }
};

function gotRemoteIceCandidate(event) {
    if (event.candidate) {
        myPeerConnection.addIceCandidate(event.candidate)
            .then()
            .catch(() => console.log('Получен удаленный кандидат, но выслать не получилось'));

    }
};

function gotLocalDescription(desc) {
    myPeerConnection.setLocalDescription(desc);

    remotePeerConnection.setRemoteDescription(desc);
    remotePeerConnection.createAnswer()
        .then(gotRemoteDescription)
        .catch(() => console.log('Создать ансвер не получилось'));
};

function gotRemoteDescription(desc) {
    remotePeerConnection.setLocalDescription(desc)
        .then(() => {
            myPeerConnection.setRemoteDescription(desc)
                .then(/*() => { console.log('у локального пира выполнен setRemoteDescription'); }*/)
                .catch(() => console.log('не получилось сделать remoteDescription у remotePeerConnection'));
        })
        .catch(() => console.log('не получилось сделать setLocalDescription у remotePeerConnection'));
};
////////////////////////////////////////////
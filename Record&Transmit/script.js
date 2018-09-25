var video;
var recordedVideo;
var myPeerConnection;
var remotePeerConnection;
var PeerConnection;
var theirVideo;
var mediaRecorder;
var recordedBlobs;
var recordedBlobssuperBuffer;
var remoteStream;
var kostil;
var blobFirst;
var blobSecond;

const description = {
    offerToReceiveAudio: 1,
    offerToReceiveVideo: 1
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

/**
 * Связываение с элементами на HTML
 */
function pageReady() {
    theirVideo = document.getElementById('theirVideo');
    video = document.getElementById('video');
    recordedVideo = document.getElementById('recordedVideo');
}

/**
 * Получаем локальный поток с камеры
 */
function runPromise() {
    navigator.getMedia({
        video: true,
        audio: true
    }, function (stream) {
        video.srcObject = stream;
        createPeerConnection(stream);
    }, function (error) {
    })
}

/**
 * Функция срабатывает как только появялется поток на удаленном пире
 * @param {*} event 
 */
function gotRemoteStream(event) {
    remoteStream = event.streams[0];
    console.log('связь с удаленным пиром установлена');
    theirVideo.srcObject = remoteStream;
};

/**
 * Функция срабатывает при нажатии на соответствующую кнопку. Используется MediaRecorder API
 */
function startRecording() {
    kostil = true;
    //    recordedBlobs = [];
    let options = { mimeType: 'video/webm;codecs=vp9' };
    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        console.log(options.mimeType, ' не поддерживается');
    } else {
        //        try {
        mediaRecorder = new MediaRecorder(remoteStream, options);
        // } catch (error) {
        //     console.error('Произошла ошибка при создании MediaRecorder:', error);
        //     return;
        // }
        mediaRecorder.ondataavailable = handleDataAvailable;
        mediaRecorder.start();                     //в скобках указано с какой периодичностью будет срабатывать ondataavailable.
    }
}

function itsTime() {
    mediaRecorder.requestData();
    mediaRecorder.stop();
    mediaRecorder.start();
}

function handleDataAvailable(event) {
    if (event.data && event.data.size > 0) {
        if (blobFirst && blobSecond) {
            blobFirst = null;
            blobSecond = null;
        }
        if (!blobFirst) { blobFirst = event.data; }
        else if (!blobSecond){ blobSecond = event.data; }
        recordedBlobs = event.data;
        if (blobFirst && blobSecond) {
            playBothBlobs(blobFirst, blobSecond);
        }
        // playRecord(event.data);
        //---------------------------
        // const url = window.URL.createObjectURL(event.data);
        // const a = document.createElement('a');
        // a.style.display = 'none';
        // a.href = url;
        // a.download = 'test.webm';
        // document.body.appendChild(a);
        // a.click();
        // setTimeout(() => {
        //     document.body.removeChild(a);
        //     window.URL.revokeObjectURL(url);
        // }, 100);
        //---------------------------
    }
}

function playBothBlobs(blobFirst, blobSecond) {
    console.log('1');
    recordedVideo.src = window.URL.createObjectURL(blobFirst);
    console.log('2');
    recordedVideo.onended = () => {
        console.log('3');
        blobFirst = null;
        console.log('первое видео закончилось, второе еще не началось');
        recordedVideo.src = window.URL.createObjectURL(blobSecond);
        recordedVideo.onended = () => { blobSecond = null; }
    }
}

function playRecord(blob) {
    recordedVideo.src = window.URL.createObjectURL(blob);
    console.log('mediaRecorder playRecord: ', mediaRecorder);
}

function stopRecording() {
    if (mediaRecorder && mediaRecorder.state == 'recording') {
        mediaRecorder.stop();
        //        superBuffer = new Blob(recordedBlobs, { type: 'video/webm' });
        kostil = false;
    }
}

function downloadFile() {
    const url = window.URL.createObjectURL(recordedBlobs);
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
    theirVideo.srcObject = null;
    myPeerConnection.close();
    remotePeerConnection.close();
    myPeerConnection = null;
    remotePeerConnection = null;
}

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

window.setInterval(() => {
    if (!kostil) {
        return;
    }
    itsTime();
}, 5000);
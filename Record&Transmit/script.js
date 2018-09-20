var video;
var myPeerConnection;
var remotePeerConnection;
var PeerConnection;
var SessionDescription;
var theirVideo;
var localStream;
var mediaRecorder;
var recordedBlobs = [];
var superBuffer;
//var output;

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

function pageReady() {
    // console.log(navigator.mediaDevices.enumerateDevices());
    theirVideo = document.getElementById('theirVideo');
    video = document.getElementById('video');
    //    output = document.getElementById('output');
}

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

//Success! Show the remote video...
function gotRemoteStream(event) {
    window.stream = event.streams[0];
    theirVideo.srcObject = event.streams[0];
};

function startRecording() {

    console.log('вошли в функцию startRecording');
    let options = { mimeType: 'video/webm;codecs=vp9' };
    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        console.log(options.mimeType, ' не поддерживается');
    } else {
        try {
            mediaRecorder = new MediaRecorder(window.stream, options);
        } catch (error) {
            console.error('Произошла ошибка при создании MediaRecorder:', error);
            return;
        }
        console.log('Создан MediaRecorder ', mediaRecorder, ' с настройками ', options);
        mediaRecorder.onstop = (event) => {
            console.log('MediaRecorder остановлен: ', event);
        }
        mediaRecorder.ondataavailable = handleDataAvailable;
        mediaRecorder.start(10);
        console.log('MediaRecorder started', mediaRecorder);
    }
}

function handleDataAvailable(event){
    superBuffer = new Blob(recordedBlobs, {type: 'video/webm'});
    console.log('вошли в метод handleDataAvailable');
    if (event.data && event.data.size > 0) {
        recordedBlobs.push(event.data);
      }
}

function createPeerConnection(stream) {
    //Create the local peer connection                                      
    myPeerConnection = new PeerConnection(null);
    console.log('Создан локальный пир');

    //Create the remote peer connection                                     
    remotePeerConnection = new PeerConnection(null);
    console.log('Создан удаленный пир');

    //Listen for ICE candidates on each                                     
    myPeerConnection.onicecandidate = gotMyIceCandidate;
    remotePeerConnection.onicecandidate = gotRemoteIceCandidate;

    //Handle streams on each peer                                           
    myPeerConnection.addStream(stream);
    console.log('добавлен локальный стрим на локальный пир');
    // remotePeerConnection.onaddstream = gotRemoteStream;
    remotePeerConnection.ontrack = gotRemoteStream;

    //Create local peer connection offer                                    
    myPeerConnection.createOffer(description)
        .then(gotLocalDescription)
        .catch(() => { console.log('Создать локальный оффер не получилось') });
};

//When local ICE candidate is received...
function gotMyIceCandidate(event) {
    if (event.candidate) {
        //Send the local ICE candidate to remote peer
        remotePeerConnection.addIceCandidate(event.candidate)
            .then(() => {
                console.log('Получен мой кандидат и выслан удаленный');
            })
            .catch(() => console.log('Получен мой кандидат, но выслать не получилось'));
        // console.log('Sent my Ice candidates to remotePeerConnection');
    }
};

//When remote ICE candidates are received by me...
function gotRemoteIceCandidate(event) {
    console.log('вошли в функцию gotRemoteIceCandidate');
    if (event.candidate) {
        //Add the remote ICE candidate to my local peer connection
        myPeerConnection.addIceCandidate(event.candidate)
            .then(() => console.log('Получен удаленный кандидат и выслан мой'))
            .catch(() => console.log('Получен удаленный кандидат, но выслать не получилось'));

    }
};

//create the SDP offer!
function gotLocalDescription(desc) {
    myPeerConnection.setLocalDescription(desc);
    console.log('у локального пира выполнен setLocalDescription');
    remotePeerConnection.setRemoteDescription(desc);
    console.log('у удаленного пира выполнен setRemoteDescription');
    remotePeerConnection.createAnswer()
        .then(gotRemoteDescription)
        .catch(() => console.log('Создать ансвер не получилось'));
    console.log('создан ансвер у удаленного пира');
};

//When remote SDP arrives...
function gotRemoteDescription(desc) {
    console.log('desc: ',desc);
    remotePeerConnection.setLocalDescription(desc)
        .then(() => {
            console.log('у удаленного пира выполнен setLocalDescription');
            myPeerConnection.setRemoteDescription(desc)
                .then(() => { console.log('у локального пира выполнен setRemoteDescription'); })
                .catch(() => console.log('не получилось сделать remoteDescription у remotePeerConnection'));
        })
        .catch(() => console.log('не получилось сделать setLocalDescription у remotePeerConnection'));
};

function stopRecording() {
    mediaRecorder.stop();
    console.log('Записанный superBuffer: ', superBuffer);
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
    localStream.getTracks().forEach(track => track.stop());
    myPeerConnection.close();
    remotePeerConnection.close();
    myPeerConnection = null;
    remotePeerConnection = null;
}
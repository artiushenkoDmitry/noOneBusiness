var streamLocal;
var video;
var myPeerConnection;
var remotePeerConnection;
var PeerConnection;
var SessionDescription;
var theirVideo;
var localStream;
var output;

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

SessionDescription = window.RTCSessionDescription ||
    window.mozRTCSessionDescription;

function pageReady() {
    // console.log(navigator.mediaDevices.enumerateDevices());
    theirVideo = document.getElementById('theirVideo');
    video = document.getElementById('video');
    output = document.getElementById('output');
}

function runPromise() {
    navigator.getMedia({
        video: true,
        audio: true
    }, function (stream) {
        localStream = stream;
        video.srcObject = stream;
        createPeerConnection(stream);
        // showStats(stream);
    }, function (error) {
    })
}

//Success! Show the remote video...
function gotRemoteStream(event) {
    var theirStream = event.streams[0].getVideoTracks()[0];
    console.log('theirStream');
    console.log(theirStream);
    theirVideo.srcObject = event.streams[0];
    // console.log('event.streams[0]');
    // console.log(event.streams[0]);
    // theirVideo.play();
    console.log('Got remote stream!');
};

///////////////////////////////////тут мы будем пытаться отображать два экрана
function createPeerConnection(stream) {
    //Create the local peer connection                                      1
    myPeerConnection = new PeerConnection(null);
    console.log('Создан локальный пир');

    //Create the remote peer connection                                     1
    remotePeerConnection = new PeerConnection(null);
    console.log('Создан удаленный пир');

    //Listen for ICE candidates on each                                     2
    myPeerConnection.onicecandidate = gotMyIceCandidate;
    remotePeerConnection.onicecandidate = gotRemoteIceCandidate;

    //Handle streams on each peer                                           3
    myPeerConnection.addStream(stream);
    console.log('добавлен локальный стрим на локальный пир');
    // remotePeerConnection.onaddstream = gotRemoteStream;
    remotePeerConnection.ontrack = gotRemoteStream;

    //Create local peer connection offer                                    4
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
    console.log('desc');
    console.log(desc);
    remotePeerConnection.setLocalDescription(desc)
        .then(() => {
            console.log('у удаленного пира выполнен setLocalDescription');
            myPeerConnection.setRemoteDescription(desc)
                .then(() => { console.log('у локального пира выполнен setRemoteDescription'); })
                .catch(() => console.log('не получилось сделать remoteDescription у remotePeerConnection'));
        })
        .catch(() => console.log('не получилось сделать setLocalDescription у remotePeerConnection'));
};

function end() {
    console.log('end')
    localStream.getTracks().forEach(track => track.stop());
    myPeerConnection.close();
    remotePeerConnection.close();
    myPeerConnection = null;
    remotePeerConnection = null;
}

function getReceiverStats() {
    console.log('///////////////////////////////////////////////////////////');
    console.log(myPeerConnection.getSenders());
    console.log('///////////////////////////////////////////////////////////');
    const receiver = remotePeerConnection.getReceivers()[0];
    receiver.getStats().then(res => {
        res.forEach(report => {
            console.log('report');
            console.log(report);
            if (report.type === 'inbound-rtp') {
                output.innerHTML = 'bytesReceived: ' + report.bytesReceived;
            }
        });
    });
}

function getSenderStats() {
    console.log('///////////////////////////////////////////////////////////');
    console.log(myPeerConnection.getSenders());
    console.log('///////////////////////////////////////////////////////////');
    const sender = myPeerConnection.getSenders()[1];
    sender.getStats().then(res => {
        res.forEach(report => {
            console.log('report');
            console.log(report);
        });
    });
}

// window.setInterval(() => {
//     if (!remotePeerConnection) {
//       return;
//     }

//     const receiver = remotePeerConnection.getReceivers()[0];
//     receiver.getStats().then(res => {
//         res.forEach(report => {
//             console.log('report');
//             console.log(report);
//         });
//     });

    // const sender = myPeerConnection.getSenders()[0];
    // console.log('sender');
    // console.log(sender);
    // sender.getStats().then(res => {
    //     res.forEach(report => {
    //         console.log('report');
    //         console.log(report);
    //     });
    // });
// },1000)




////////////////////////////////
// function showStats(stream) {
//     var pc = new PeerConnection();
//     pc.addStream(stream);
//     var sender = pc.getSenders()[0];
//     sender.getStats().then(res=>{
//         res.forEach(report=>{
// //            if (report.type === 'inbound-rtp') {
//                 console.log('report');
//                 console.log(report);
// //            }
//         })
//     }).catch(()=> console.log('нихера не получилось'));

// }

//////////////////////////////тут мы будем пытаться отобразить статистику
// function showStats(stream){
//     var pc = new RTCPeerConnection();                           //создаем переменную RTCPeerConnection
//     pc.addStream(stream);                                       //добавляем в нее имеющийся стрим
//     var streamArray = pc.getLocalStreams(stream);                     //получаем массив всех имеющихся стримов (локальных, не удаленных). Массив можно и не создавать, если точно знаешь ,что стрим 1
//     var selector = streamArray[0].getVideoTracks()[0];
//     var promise = pc.getStats(selector);
//     promise
//     .then((report)=>{
//         for(var i in report){
//             var stats = report.get(id);
//             console.log("stats");
//             console.log(stats);
//         }
//     })
//     .catch(()=>console.log('промис не отработал'));
// }

//////////////

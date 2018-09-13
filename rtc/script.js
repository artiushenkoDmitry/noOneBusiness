var streamLocal;
var video;
var myPeerConnection;
var remotePeerConnection;
var PeerConnection;
var SessionDescription;
var theirVideo;
var localStream;
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
//        vendorUrl = window.URL;
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
    remotePeerConnection.ontrack=gotRemoteStream;

    //Create local peer connection offer                                    4
    myPeerConnection.createOffer(description)
    .then(gotLocalDescription)
    .catch(()=>{console.log('Создать локальный оффер не получилось')});
};

//When local ICE candidate is received...
function gotMyIceCandidate(event) {
    if (event.candidate) {
        //Send the local ICE candidate to remote peer
        remotePeerConnection.addIceCandidate(event.candidate)
        .then(() => {
            console.log('Получен мой кандидат и выслан удаленный');})
        .catch(()=>console.log('Получен мой кандидат, но выслать не получилось'));
        // console.log('Sent my Ice candidates to remotePeerConnection');
    }
};

//When remote ICE candidates are received by me...
function gotRemoteIceCandidate(event) {
    console.log('вошли в функцию gotRemoteIceCandidate');
    if (event.candidate) {
        //Add the remote ICE candidate to my local peer connection
        myPeerConnection.addIceCandidate(event.candidate)
        .then(()=>console.log('Получен удаленный кандидат и выслан мой'))
        .catch(()=>console.log('Получен удаленный кандидат, но выслать не получилось'));
        
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
    .catch(()=>console.log('Создать ансвер не получилось'));
    console.log('создан ансвер у удаленного пира');
};

//When remote SDP arrives...
function gotRemoteDescription(desc) {
    console.log('desc');
    console.log(desc);
    remotePeerConnection.setLocalDescription(desc)
    .then(()=>{
        console.log('у удаленного пира выполнен setLocalDescription');
            myPeerConnection.setRemoteDescription(desc)
            .then(()=>{console.log('у локального пира выполнен setRemoteDescription');})
            .catch(()=>console.log('не получилось сделать remoteDescription у remotePeerConnection'));
    })
    .catch(()=>console.log('не получилось сделать setLocalDescription у remotePeerConnection'));
};

window.setInterval(() => {
    if (!myPeerConnection) {
      return;
    }
    const sender = myPeerConnection.getSenders()[0];
    console.log('myPeerConnection: ', myPeerConnection);
    console.log('sender.parameters: ',sender.getParameters());
    sender.getStats()
    .then(()=>{console.log('res: ', res);})
    .catch(()=>{console.log('Ошибка при получении объекта RTCStatsReport');});
//    console.log('1');

},1000)




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

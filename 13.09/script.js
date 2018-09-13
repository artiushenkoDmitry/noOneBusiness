var startButton;
var endButton;

var localStream

var videoOriginal;
var videoSecond;
var videoThird;
var videoFourth;

var originPC2;
var secondPC;
var originPC3;
var thirdPC;
var originpc4;
var fourthPC;

var windowNumber;

//Адаптация под разные браузеры
navigator.mediaDevices.getUserMedia = navigator.mediaDevices.getUserMedia || navigator.mediaDevices.mozGetUserMedia || navigator.mediaDevices.webkitGetUserMedia;
window.RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
window.RTCIceCandidate = window.RTCIceCandidate || window.mozRTCIceCandidate || window.webkitRTCIceCandidate;
window.RTCSessionDescription = window.RTCSessionDescription || window.mozRTCSessionDescription || window.webkitRTCSessionDescription;

function pageReady() {
    console.log('вошли в функцию pageReady');
    videoOriginal = document.getElementById('videoOriginal');
    videoSecond = document.getElementById('videoSecond');
    videoThird = document.getElementById('videoThird');
    videoFourth = document.getElementById('videoFourth');
}

const description = {
    offerToReceiveAudio: 1,
    offerToReceiveVideo: 1
}

function gotRemoteStream(event) {
    console.log('зашли в функцию gotRemoteStream');
    console.log(windowNumber);
    switch(windowNumber){
        case 2:
        videoSecond.srcObject = event.streams[0];
        break;
        case 3:
        videoThird.srcObject = event.streams[0];
        break;
        case 4:
        videoFourth.srcObject = event.streams[0];
        break;
    }
    windowNumber = 0;
    // videoThird.srcObject = event.streams[0];
}

function start() {
    console.log('start')
    navigator.mediaDevices
        .getUserMedia({
            audio: true,
            video: true
        })
        .then((stream) => {
            videoOriginal.srcObject = stream;
            localStream = stream;
        })
        .catch((error) => {
            console.log('Ошибка в getUserMedia:', error);
        })
}

// function addSecond() {
//     console.log('добавляем второго собеседника');
//     originPC2 = new window.RTCPeerConnection(null);
//     console.log('создан originPC2');
//     secondPC = new window.RTCPeerConnection(null);
//     console.log('создан secondPC');

//     originPC2.onicecandidate = gotMyIceCandidate;
//     secondPC.onicecandidate = gotRemoteIceCandidate;
//     console.log('добавлены слушатели для каждого кандидата');

//     originPC2.addStream(localStream);
//     console.log('В originPC2 добавлен поток с камеры');

//     secondPC.ontrack = gotRemoteStream;
//     console.log('добавлен слушатель трека для secondPC');

//     originPC2.createOffer(description)
//         .then(gotLocalDescription)
//         .catch(() => { console.log('Создать оффер от originPC2 не получилось') });
// }

// function gotLocalDescription(desc) {
//     originPC2.setLocalDescription(desc);
//     console.log('У originPC2 сделали setLocalDescription');
//     secondPC.setRemoteDescription(desc);
//     console.log('У secondPC сделали setRemoteDescription');
//     secondPC.createAnswer()
//         .then(gotRemoteDescription)
//         .catch(() => console.log('Создать ансвер не получилось'));
// }

// function gotRemoteDescription(desc) {
//     secondPC.setLocalDescription(desc)
//         .then(() => {
//             originPC2.setRemoteDescription(desc)
//                 .then(() => {
//                     console.log('ансвер получен и все дескришины установлены');
//                 })
//                 .catch((error) => {
//                     console.log('Произвошла ошибка при попытке сделать setRemoteDescription у originPC2: ', error);
//                 })
//         })
//         .catch((error) => {
//             console.log('Произошла ошибка при попытке сделать setLocalDescription у secondPC: ', error);
//         });
// }

// function gotMyIceCandidate(event) {
//     if (event.candidate) {
//         secondPC.addIceCandidate(event.candidate)
//             .then(() => {
//                 console.log('Получен мой кандидат и выслан удаленный');
//             })
//             .catch(() => console.log('Получен мой кандидат, но выслать не получилось'));
//     }
// }

// function gotRemoteIceCandidate() {
//     if (event.candidate) {
//         originPC2.addIceCandidate(event.candidate)
//             .then(() => console.log('Получен удаленный кандидат и выслан мой'))
//             .catch(() => console.log('Получен удаленный кандидат, но выслать не получилось'));
//     }
// }
// function end() {
//     console.log('end')
//     localStream.getTracks().forEach(track => track.stop());
//     originPC2.close();
//     secondPC.close();
//     originPC2 = null;
//     secondPC = null;
// }
/////////////////////////////////////////////
function addSecond() {
    console.log('добавляем второго собеседника');
    originPC2 = new window.RTCPeerConnection(null);
    console.log('создан originPC2');
    secondPC = new window.RTCPeerConnection(null);
    console.log('создан secondPC');
    windowNumber = 2;

    addNewPeer(originPC2, secondPC);
}

function addThird() {
    console.log('добавляем третьего собеседника');
    originPC3 = new window.RTCPeerConnection(null);
    console.log('создан originPC3');
    thirdPC = new window.RTCPeerConnection(null);
    console.log('создан thirdPC');
    windowNumber = 3;

    addNewPeer(originPC3, thirdPC);
}

function addFourth() {
    console.log('добавляем четвертого собеседника');
    originPC4 = new window.RTCPeerConnection(null);
    console.log('создан originPC4');
    fourthPC = new window.RTCPeerConnection(null);
    console.log('создан fourthPC');
    
    windowNumber = 4;

    addNewPeer(originPC4, fourthPC);
}

function addNewPeer(originPeer, remotePeer) {
    originPeer.onicecandidate = getRearyMyIceCandidate;
    remotePeer.onicecandidate = getReadyRemoteIceCandidate;
    console.log('добавлены слушатели для каждого кандидата');

    originPeer.addStream(localStream);
    console.log('В originPeer добавлен поток с камеры');

    remotePeer.ontrack = gotRemoteStream;
    console.log('добавлен слушатель трека для remotePeer');

                                                                                //description используется для создания оффера. Но это не то описание
    originPeer.createOffer(description)                                         //которое нужно для  gotLocalDescription
    .then((desc) => { gotLocalDescription(desc, originPeer, remotePeer) })      //desc предоставляется промисом createOffer. После этого его получает 
                                                                                //анонимная функция получает desc и передает это описание в 
                                                                                //именованную функцию gotLocalDescription.
        .catch(() => { console.log('Создать оффер от originPeer не получилось') });

    function getRearyMyIceCandidate(event) {
        gotMyIceCandidate(event, remotePeer)
    }
    function getReadyRemoteIceCandidate(event) {
        gotRemoteIceCandidate(event, originPeer);
    }
}

function gotLocalDescription(desc, originPeer, remotePeer) {
    originPeer.setLocalDescription(desc);
    console.log('У originPeer сделали setLocalDescription');
    remotePeer.setRemoteDescription(desc);
    console.log('У remotePeer сделали setRemoteDescription');
    remotePeer.createAnswer()
        .then((desc) => { gotRemoteDescription(desc, originPeer, remotePeer) })
        .catch(() => console.log('Создать ансвер не получилось'));
}

function gotRemoteDescription(desc, originPeer, remotePeer) {
    remotePeer.setLocalDescription(desc)
        .then(() => {
            originPeer.setRemoteDescription(desc)
                .then(() => {
                    console.log('ансвер получен и все дескрипшены установлены');
                })
                .catch((error) => {
                    console.log('Произвошла ошибка при попытке сделать setRemoteDescription у originPeer: ', error);
                })
        })
        .catch((error) => {
            console.log('Произошла ошибка при попытке сделать setLocalDescription у remotePeer: ', error);
        });
}

function gotMyIceCandidate(event, remotePeer) {
    if (event.candidate) {
        remotePeer.addIceCandidate(event.candidate)
            .then(() => {
                console.log('Получен мой кандидат и выслан удаленный');
            })
            .catch(() => console.log('Получен мой кандидат, но выслать не получилось'));
    }
}

function gotRemoteIceCandidate(event, originPeer) {
    if (event.candidate) {
        originPeer.addIceCandidate(event.candidate)
            .then(() => console.log('Получен удаленный кандидат и выслан мой'))
            .catch(() => console.log('Получен удаленный кандидат, но выслать не получилось'));
    }
}

function end() {
    console.log('end')
    localStream.getTracks().forEach(track => track.stop());
    originPC3.close();
    thirdPC.close();
    originPC3 = null;
    thirdPC = null;
}
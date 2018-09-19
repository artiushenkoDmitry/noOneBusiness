var localStream;                     //содержит поток от выбранного устройства
var video;                           //связывается с соответствующим дивом в HTML
var videoSelect;                     //связывается с соответствующим дивом в HTML
var theirVideo;
var myPeerConnection;
var remotePeerConnection;

navigator.getMedia = navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia ||
    navigator.msGetUserMedia;

PeerConnection = window.RTCPeerConnection ||
    window.mozRTCPeerConnection;

SessionDescription = window.RTCSessionDescription ||
    window.mozRTCSessionDescription;
/**
*Функция срабатывает после загрузки всей HTML страницы. Тут связываются все необходимые поля с нужными элементами и определяется список доступных 
*медиа устройст. Массив с этими устройствами передается в функцию gotDevices
*/ 
function pageReady() {
    video = document.getElementById('video');
    videoSelect = document.getElementById('videoSource');
    theirVideo = document.getElementById('theirVideo');
    navigator.mediaDevices.enumerateDevices()
            .then((devices) => { gotDevices(devices); })
            .catch(() => { console.log('Произошла ошибка при попытке получения списка устройств'); });
}

/**
 * Эта функция срабатывает по нажатию на соответствующую кнопнку на странице или при выборе камеры. Так же тут по id медиа устройства получаем поток из 
 * соответствующего устройства и передаем его на страницу в соответствующий блок.
 * После выполнения промиса вызывается ф-я createPeerConnection
 */
function runPromise() {
    if (localStream) {
        localStream.getTracks().forEach(track => {
            track.stop();
        });
    }

    let videoSource = videoSelect.value;

    navigator.getMedia({
        //        video:{deviceId: videoSource ? {exact: videoSource} : undefined},
        video: { deviceId: videoSource },
        audio: true
    }, function (stream) {
        localStream = stream;
        video.srcObject = localStream;
        createPeerConnection(localStream);
    }, function (error) {
        console.log('Произошла ошибка при попытке получения медиа потока от устройства');
    })
}

/**
 * Эта функция помещает поток в соответствующий блок на странице на стороне удаленного пира.
 * @param {*} event - событие срабатывающее как только на удаленном пире появляется поток. event содержит в себе поток
 */
function gotRemoteStream(event) {
    theirVideo.srcObject = event.streams[0];
    console.log('Got remote stream!');
};

/**
 * Тут создаются пиры, слушатели кандидатов, в локальный пир добавляется поток, создается слушатель трека на удаленном пире, создается оффер. 
 */
function createPeerConnection(){
myPeerConnection = new RTCPeerConnection(null);
console.log('создан myPeerConnection');
remotePeerConnection = new RTCPeerConnection(null);
console.log('создан remotePeerConnection');

myPeerConnection.onicecandidate = gotMyIceCandidate;
remotePeerConnection.onicecandidate = gotRemoteIceCandidate;

myPeerConnection.addStream(localStream);
remotePeerConnection.ontrack = gotRemoteStream;

myPeerConnection.createOffer()
.then(gotLocalDescription)
.catch(() => { console.log('Создать локальный оффер не получилось') });
}

/**
 * Функция вызывается соответствующим слушателем после получения кандидата. 
 * @param {*} event 
 */
function gotMyIceCandidate(event){
    if (event.candidate) {
        remotePeerConnection.addIceCandidate(event.candidate)
            .then(() => {
                console.log('Получен мой кандидат и выслан удаленный');
            })
            .catch(() => console.log('Получен мой кандидат, но выслать не получилось'));
    }
}

/**
 * Функция вызывается соответствующим слушателем после получения кандидата. 
 * @param {*} event 
 */
function gotRemoteIceCandidate(event){
    console.log('вошли в функцию gotRemoteIceCandidate');
    if (event.candidate) {
        myPeerConnection.addIceCandidate(event.candidate)
            .then(() => console.log('Получен удаленный кандидат и выслан мой'))
            .catch(() => console.log('Получен удаленный кандидат, но выслать не получилось'));

    }
}

/**
 * Функция вызываемая в случае успешного создания оффера.
 * @param {*} desc 
 */
function gotLocalDescription(desc){
    myPeerConnection.setLocalDescription(desc);
    console.log('у локального пира выполнен setLocalDescription');
    remotePeerConnection.setRemoteDescription(desc);
    console.log('у удаленного пира выполнен setRemoteDescription');
    remotePeerConnection.createAnswer()
        .then(gotRemoteDescription)
        .catch(() => console.log('Создать ансвер не получилось'));
    console.log('создан ансвер у удаленного пира');
}

/**
 * Функция вызываемая в случае успешного создания ансвера
 * @param {*} desc 
 */
function gotRemoteDescription(desc){
    remotePeerConnection.setLocalDescription(desc)
        .then(() => {
            console.log('у удаленного пира выполнен setLocalDescription');
            myPeerConnection.setRemoteDescription(desc)
                .then(() => { console.log('у локального пира выполнен setRemoteDescription'); })
                .catch(() => console.log('не получилось сделать remoteDescription у remotePeerConnection'));
        })
        .catch(() => console.log('не получилось сделать setLocalDescription у remotePeerConnection'));
}

/**
 * Эта функция получает массив доступных медиа устройств и заполняет ими дропбокс "videoSource"
 * @param {*} devices 
 */
function gotDevices(devices) {
    console.log('доступные устройства:', devices);
    for (let index = 0; index < devices.length; ++index) {
        let device = devices[index];
        const option = document.createElement('option');
        if (device.kind === 'videoinput') {
            option.text = device.deviceId;
            videoSelect.appendChild(option);
        }
    }
}

/**
 * Функция останавливает все треки и null-яет все пиры
 */
function end() {
    console.log('end')
    localStream.getTracks().forEach(track => track.stop());
    myPeerConnection.close();
    myPeerConnection = null;
    remotePeerConnection.close();
    remotePeerConnection = null;
}
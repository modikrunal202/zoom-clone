const socket = io("/");
const videoGrid = document.getElementById("video-grid");
const myVideo = document.createElement('video');
myVideo.muted = true;
const myPeer = new Peer(undefined, {
    path: '/peerjs',
    host: '/',
    port: '443'
})


let myVideoStream;
navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream);
    myPeer.on("call", call => {
        call.answer(stream);
        const video = document.createElement('video');
        call.on("stream", userVideoStream => {
            addVideoStream(video, userVideoStream)
        })
    })
    socket.on("user-connected", (userId) => {
        console.log('connectToNewUser==', connectToNewUser);
        connectToNewUser(userId, stream)
    })
    let input = document.getElementById("chat_message");
    input.addEventListener("keyup", (event) => {
        if (event.key === 'Enter' && input.value.length !== 0) {
            let message = input.value;
            // console.log('event.key',message);
            socket.emit("message", message)
            document.getElementById('chat_message').value = "";
        }
    })
    socket.on("boradcast-message", msg => {
        console.log("-----msg---", msg);
        let chatMsgList = document.getElementById("msgList")
        var li = document.createElement("li");
        li.classList.add("message")
        li.appendChild(document.createElement('b'))
        li.appendChild(document.createTextNode("user"))
        li.appendChild(document.createElement("br"))
        li.appendChild(document.createTextNode(`${msg}`))
        chatMsgList.appendChild(li)
        scrollBottom()
        // chatMsgList.append(`<li class="message"><b>user</b></br>${msg}</li>`)
    })
});

myPeer.on('open', (id) => {
    console.log('My peer ID is: ' + id);
    socket.emit("join-room", ROOM_ID, id);
});

const connectToNewUser = (userId, stream) => {
    console.log('new user connecte---', userId);
    const call = myPeer.call(userId, stream)
    const video = document.createElement('video');
    call.on("stream", userVideoStream => {
        addVideoStream(video, userVideoStream)
    })
}
const addVideoStream = (video, stream) => {
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
        video.play();
    })
    videoGrid.append(video);
}
const scrollBottom = () => {
    let chatWindow = document.getElementsByClassName("main__chat_window")
    chatWindow.scrollTop = chatWindow.scrollHeight;
}
const muteUnmute = () => {
    const enabled = myVideoStream.getAudioTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getAudioTracks()[0].enabled = false;
        setUnmuteButton();
    } else {
        setMuteButton();
        myVideoStream.getAudioTracks()[0].enabled = true;
    }
}

const setUnmuteButton = () => {
    const html = `
        <i class="unmute fas fa-microphone-slash"></i>
        <span>Unmute</span>
    `
    document.querySelector('.main__mute__button').innerHTML = html;
}

const setMuteButton = () => {
    const html = `
        <i class="fas fa-microphone"></i>
        <span>Mute</span>
    `
    document.querySelector('.main__mute__button').innerHTML = html;
}

const playStop = () => {
    console.log('object')
    let enabled = myVideoStream.getVideoTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getVideoTracks()[0].enabled = false;
        setPlayVideo()
    } else {
        setStopVideo()
        myVideoStream.getVideoTracks()[0].enabled = true;
    }
}
const setStopVideo = () => {
    const html = `
      <i class="fas fa-video"></i>
      <span>Stop Video</span>
    `
    document.querySelector('.main__video_button').innerHTML = html;
}

const setPlayVideo = () => {
    const html = `
    <i class="stop fas fa-video-slash"></i>
      <span>Play Video</span>
    `
    document.querySelector('.main__video_button').innerHTML = html;
}
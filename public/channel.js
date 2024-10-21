const socket = io();
const user = JSON.parse("<%= JSON.stringify(user) %>".replace(/&#34;/g, '"'));
const channel = JSON.parse('<%- JSON.stringify(channel) %>');
const guild = JSON.parse('<%- JSON.stringify(guild) %>');
const message = "<%= JSON.stringify(messages) %>"
    .replace(/&#34;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');

const form = document.getElementById('form');
const input = document.getElementById('input-field');
const messagesList = document.getElementById('messages');
const sendbtn = document.getElementById('send-btn');

window.onload = () => {
    messagesList.scrollTop = messagesList.scrollHeight;
};

input.addEventListener('keydown', (key) => {
    if (key.key === 'Enter' && input.value) {
        socket.emit('messageCreate', {
            user: JSON.parse(user),
            guild: guild,
            channel: channel,
            content: input.value
        });
        input.value = '';
        messagesList.scrollTop = messagesList.scrollHeight;
    }
});

sendbtn.addEventListener('click', () => {
    if (input.value) {
        socket.emit('messageCreate', {
            user: JSON.parse(user),
            guild: guild,
            channel: channel,
            content: input.value
        });
        input.value = '';
        messagesList.scrollTop = messagesList.scrollHeight;
    }
});

socket.on('messageCreate', (msg) => {
    const item = document.createElement('li');
    item.innerHTML = `
        <li>
            <div class="flex items-start space-x-4 p-4 bg-gray-800 rounded-lg max-w-sm">
                <img src="${msg.user.profilePhoto || 'https://via.placeholder.com/35'}" alt="profile" class="w-8 h-8 rounded-full object-cover">
                <div>
                    <div class="flex items-center space-x-2">
                        <span class="font-bold text-white">${msg.user.username}</span>
                        <span class="text-sm text-gray-400">${new Date()}</span>
                    </div>
                    <p class="text-white">${msg.content}</p>
                </div>
            </div>
        </li>`;
    messagesList.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);
});

window.onload = () => {
    const messageString = "<%= JSON.stringify(messages) %>".replace(/&#34;/g, '"');

    let messages;
    try {
        messages = JSON.parse(messageString);
    } catch (error) {
        console.error("JSON parse hatası:", error.message);
        return;
    }

    messages.forEach(message => {
        const item = document.createElement('li');
        item.innerHTML = `
        <li>
            <div class="flex items-start space-x-4 p-4 bg-gray-800 rounded-lg max-w-sm">
                <img src="${message.author.profilePhoto || 'https://via.placeholder.com/35'}" alt="profile" class="w-8 h-8 rounded-full object-cover">
                <div>
                    <div class="flex items-center space-x-2">
                        <span class="font-bold text-white">${message.author.username}</span>
                        <span class="text-sm text-gray-400">${message.createdAt}</span>
                    </div>
                    <p class="text-white">${message.content}</p>
                </div>
            </div>
        </li>`;
        messagesList.appendChild(item);
    });

    messagesList.scrollTop = messagesList.scrollHeight;
};

const localAudio = document.getElementById('localAudio');
const remoteAudio = document.getElementById('remoteAudio');
const channelIdInput = document.getElementById('channelId');
const joinEffect = document.getElementById('joinEffect');
const leaveEffect = document.getElementById('leaveEffect');

let localStream;
let peerConnection;
let channelID;
let showed = 0;
let muted = false;

const config = {
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
};

document.getElementById('mute').addEventListener('click', () => {
    if (!localStream) return;
    muted = !muted;
    localStream.getAudioTracks().forEach(track => track.enabled = !muted);
    document.getElementById('mute').innerHTML = muted ? '<i class="fa-solid fa-microphone-slash"></i>' : '<i class="fa-solid fa-microphone"></i>';
});

document.getElementById('deafen').addEventListener('click', () => {
    if (!localStream) return;
    muted = !muted;
    remoteAudio.muted = muted;
    document.getElementById('deafen').innerHTML = muted ? '<i class="fas fa-volume-mute"></i>' : '<i class="fa-solid fa-headphones"></i>';
});

function joinVoiceChannel(id) {
    channelID = id;
    if (channelID) {
        socket.emit('joinChannel', { channelID, username: "<%- user.username %>" });
        joinEffect.play();
        const item = document.createElement('li');
        item.textContent = '<%- user.username %>';
        document.getElementById('voiceUsers-' + channelID).appendChild(item);
    }
    socket.on('userJoined', ({ userId, username }) => {
        if (username === "<%- user.username %>") return;
        const item = document.createElement('li');
        item.textContent = username;
        document.getElementById('voiceUsers-' + channelID).appendChild(item);
    });

    setTimeout(async () => {
        localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        localAudio.srcObject = localStream;

        peerConnection = new RTCPeerConnection(config);
        localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));

        peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit('ice-candidate', { channelID, candidate: event.candidate });
            }
        };

        peerConnection.ontrack = (event) => {
            remoteAudio.srcObject = event.streams[0];
        };

        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        socket.emit('offer', { channelID, offer });
    }, 1500);
}

function showVoiceUsers(id) {
    socket.emit('getChannel', { guildID: "<%- guild.id %>", channelID: id });
}

socket.on('offer', async (data) => {
    peerConnection = new RTCPeerConnection(config);
    localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));

    peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
            socket.emit('ice-candidate', { channelID, candidate: event.candidate });
        }
    };

    peerConnection.ontrack = (event) => {
        remoteAudio.srcObject = event.streams[0];
    };

    await peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    socket.emit('answer', { channelID, answer });
});

socket.on('answer', async (data) => {
    await peerConnection.setRemoteDescription(new RTCSessionDescription(data));
});

socket.on('ice-candidate', async (data) => {
    try {
        if (data.candidate) {
            await peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
        }
    } catch (e) {
        console.error('ICE Candidate eklenirken hata:', e);
    }
});

socket.on('userLeft', (user) => {
    setTimeout(() => {
        leaveEffect.play();
    }, 2000);
});

import express from "express";
import session from "express-session";
import {createServer} from "node:http"
import bodyParser from "body-parser";
import mongoose from "mongoose";
import flash from "connect-flash";

import authrouter from "./router/auth.js";
import channelrouter from "./router/channel.js";
import userrouter from "./router/user.js";

import passport from "passport";
import { Server } from "socket.io";
import User from "./models/user.js";
import passprt from "./passport/check.js"
import message from "./models/message.js";

const app = express();
const server = createServer(app);
const io = new Server(server);
import Honeybadger from "@honeybadger-io/js";
Honeybadger.configure({
  apiKey: "hbp_YPi5Bbm3Hy0quz58KlWfUxJQ4h9m1N09SZjO",
  environment: "production"
});
Honeybadger.notify("Testing Honeybadger!");
mongoose.connect('mongodb+srv://123:123@cluster0.rxp2r.mongodb.net/discord').then(() => {
    console.log('Database ok');
    
}).catch((err) => {
    console.log('database cu')
});
app.use(flash());
app.use(session({ secret:'omg', saveUninitialized: true, resave: true }))
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: false, limit:'20mb' }));
app.use(bodyParser.json({ limit:'20mb'}));
app.set('view engine', 'ejs');

app.use('/auth/', authrouter);
app.use('/channels/', channelrouter);
app.use('/user/', userrouter);
app.use(async function(req, res, next) {
    res.locals.user = req.user;
    req.user ? res.locals.guilds = await User.findOne({ id: req.user.id }).populate('guilds').guilds : ''
    next();
  });

const users = {};
const HEARTBEAT_TIMEOUT = 10000;

app.get('/heartbeat/:id', async (req, res) => {
    var { id } = req.params;
    try {
        // Eğer MongoDB'deki kullanıcı ID'si `_id` ise, bunu kullan
        const user = await User.findOneAndUpdate({ id:id }, { lastHeartbeat: new Date() });
        console.log('Heartbeat from user:', id);
        res.send('OK');
    } catch (error) {
        console.error('Error updating heartbeat:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/status/:id', async (req, res) => {
    try {
        const users = await User.find({});
        const activeUsers = {};
    
        users.forEach(user => {
          const lastHeartbeat = user.lastHeartbeat;
          if (Date.now() - new Date(lastHeartbeat).getTime() <= HEARTBEAT_TIMEOUT) {
            activeUsers[user.id] = 'active';
          } else {
            activeUsers[user.id] = 'inactive';
          }
        });

        const userStatus = activeUsers[req.params.id];
        if (userStatus) {
          res.json({ status: userStatus });
        } else {
          res.status(404).send('User not found or inactive');
        }
    } catch (error) {
        console.error('Error fetching user status:', error);
        res.status(500).send('Internal Server Error');
    }
});


app.get('/', (req,res) => {
    res.render('index')
})
io.on('connection', (socket) => {
    socket.broadcast.emit('user-connected', socket.id);
    socket.on('messageCreate', (msg) => {
        console.log(msg)
        new message({
            id: Math.floor(Math.random() * 199999999),
            author: msg.user,
            content: msg.content,
            guildId: msg.guild.id,
            channelId: msg.channel.id
        }).save();
        io.emit('messageCreate', msg)
    })
});

const channels = {};

io.on('connection', (socket) => {
    console.log('Yeni bir kullanıcı bağlandı:', socket.id);

    // Kullanıcı bir kanala katıldığında
    socket.on('joinChannel', ({ channelID, username }) => {
        if (!channels[channelID]) {
          channels[channelID] = { users: [] }; // Eğer kanal yoksa yeni bir kanal oluştur
        }
        
        channels[channelID].users.push({ id: socket.id, username }); // Kullanıcıyı kanala ekle
        socket.join(channelID); // Kullanıcıyı belirtilen kanala kat
        
        // Kanaldaki diğer kullanıcılara yeni kullanıcının katıldığını bildir
        io.to(channelID).emit('userJoined', { userId: socket.id, username:username });
        
        console.log(`Kullanıcı ${username} (${socket.id}) kanala katıldı: ${channelID}`);
      });
    // Kullanıcı bir sesli kanal oluşturduğunda
    socket.on('createChannel', (channelID) => {
        if (!channels[channelID]) {
            channels[channelID] = { users: [] };
            console.log(`Yeni sesli kanal bilgisi istendi: ${channelID}`);
        }
    });
    // socket.on('getChannel', ({guildID, channelID}) => {
    //     io.emit('getChannelUsers', {channel:{users:channels[channelID], id: channelID}})
    // })
    // Ses iletimi için sinyalleri yönet
    socket.on('offer', (data) => {
        socket.to(data.channelID).emit('offer', { offer: data.offer, from: socket.id });
    });

    socket.on('answer', (data) => {
        socket.to(data.channelID).emit('answer', data.answer);
    });

    socket.on('ice-candidate', (data) => {
        socket.to(data.channelID).emit('ice-candidate', { candidate: data.candidate });
    });

    // Kullanıcı bağlantısını kestiğinde
    socket.on('disconnect', () => {
        console.log('Kullanıcı bağlantısını kesti:', socket.id);
        for (const channelID in channels) {
            const index = channels[channelID].users.indexOf(socket.id);
            if (index !== -1) {
                channels[channelID].users.splice(index, 1);
                io.to(channelID).emit('userLeft', { userId: socket.id }); // Diğer kullanıcılara bildirim gönder
                console.log(`Kullanıcı ${socket.id} kanaldan ayrıldı: ${channelID}`);
            }
        }
    });
});
server.listen(3400)
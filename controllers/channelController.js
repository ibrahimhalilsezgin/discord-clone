import User from "../models/user.js";
import Channel from "../models/channel.js";
import message from "../models/message.js";
import Guild from "../models/guild.js";

const guild = async (req, res) => {
    const { guildID } = req.params;

    try {
        const user = await User.findOne({ id: req.user.id }).populate('guilds')
        const guildData = await Guild.findOne({ id: guildID }).populate('members')
        if(!user.guilds.some(guild => guild.id === guildData.id)) {
            return res.send("bu sunucuya erişimin yok")
        }
        const channels = await Promise.all(
            guildData.channels.map(async (channelId) => {
                return await Channel.findOne({ _id: channelId });
            })
        );
        
        // console.log(req.user.guilds)
        res.render('guild', {
            user: user,
            guild: guildData,
            channels: channels,
            guilds: user.guilds
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Sunucu hatası'); // Hata durumunda uygun bir yanıt verin
    }
}

const channel = async (req, res) => {
    var {guildID, channelID} = req.params;
    const user = await User.findOne({ id: req.user.id }).populate('guilds')
    const guildData = await Guild.findOne({ id: guildID }).populate('members')
    if(!user.guilds.some(guild => guild.id === guildData.id)) {
        return res.send("bu kanala erişimin yok")
    }
    const channels = await Promise.all(
        guildData.channels.map(async (channelId) => {
            return await Channel.findOne({ _id: channelId });
        })
    );
    const chnl = await Channel.findOne({ guildID: guildID, id: channelID });
    // console.log(await message.find({ guildId: guildID, channelId: channelID }).populate('author'))
    res.render('channel', {
        messages: await message.find({ guildId: guildID, channelId: channelID }).populate('author'),
        user: user,
        guild: guildData,     
        channel:  chnl,   
        channels: channels,
        guilds: user.guilds
    })
}


const createGuild = async (req, res) => {
    var {guildName} = req.body;
    var id = generateSnowflake();
    if(req.user.guilds.length >= 100) {
        return res.status(400).json({ message: 'Maximum Sunucuya Ulaştın' });
    }
    if(!guildName) {
        return res.send('sunucu adı belirtlemisin')
    }

    new Guild({
        id: id,
        name: guildName,
        ownerID: req.user.id,
        members:[req.user._id]
    }).save().then(async (guild)=>{
        await User.findOneAndUpdate({id: req.user.id}, {
            $push:{
                guilds: guild._id
            }
        })
    })
    return res.redirect('/channels/' + id);
}
const joinGuild = async (req, res) => {
    const {guildInviteCode: code} = req.body;

    if(!req.user) {
        
    };

    const guild = await Guild.findOne({ inviteCode: code });
    if(!guild) {
        return res.send('böyle bir sunucu yok?')
    }
    await Guild.findOneAndUpdate({ inviteCode: code }, { 
        $push:{
            members: req.user._id
        }
    })
    if(guild.members.some(x => x._id === req.user._id)) {
        return;
    }
    await User.findOneAndUpdate({ id: req.user.id }, {
        $push:{
            guilds:guild._id
        }
    });

    return res.redirect('/channels/' + guild.id);
}
const createChannel = async (req, res) => {
    var {channelName, guildID, type} = req.body;
    var id = generateSnowflake();
    new Channel({
        id:id,
        name:channelName,
        guildID: guildID,
        type: type
    }).save().then(async x => {
        await Guild.findOneAndUpdate({ id: guildID }, {$push:{
            channels: x._id
        }})
        return res.redirect(`/channels/${guildID}/${x.id}`)
    })
}

// Snowflake parametreleri
const DISCORD_EPOCH = 1420070400000n; // Discord Epoch 2015-01-01T00:00:00.000Z

function generateSnowflake() {
  const timestamp = BigInt(Date.now()); // Şu anki zaman damgası
  const snowflake = (timestamp - DISCORD_EPOCH) << 22n; // 22 bit kaydırarak ekleme

  // Eğer isterseniz, sequence ve shard id gibi başka bitler ekleyebilirsiniz
  // Ancak bu basit versiyonda sadece zaman damgası kullanıldı
  return snowflake.toString();
}

export default {
    guild,
    channel,
    createGuild,
    createChannel,
    joinGuild
};
import { Schema, model, Types } from "mongoose";

const guildSchema = new Schema({
    id: {
        type: Number,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    icon: {
        type: String,
        required: false,
    },
    ownerID: {
        type: Number,
        required: true
    },
    memberCount: {
        type: Number,
        required: true,
        default:1
    },
    channels: [{ type: Schema.Types.ObjectId, ref: 'channel' }],
    members: [{ type: Schema.Types.ObjectId, ref:'user'}],
    inviteCode: {
        type:String,
        default: [...Array(Math.floor(Math.random() * 13) + 8)].map(() => 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'.charAt(Math.floor(Math.random() * 62))).join('')

    }
}, { timestamps: true });

export default model('guild', guildSchema); 

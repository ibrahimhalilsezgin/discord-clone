import {Schema, model, Types} from "mongoose";
import moment from "moment";
const messageSchema = new Schema({
    id: {
        type:Number,
        required: true
    },
    author: {
        type: Types.ObjectId,
        ref: 'user'
    },
    guildId:{
        // type: Types.ObjectId,
        // ref: 'guild',
        // required: true,
        type:Number,
        default:0
    },
    channelId:{
        // type: Types.ObjectId,
        // ref: 'guild',
        // required: true,
        type:Number,
        default:0
    },
    content: {
        type:String,
        required: true,
        minLength:0
    },
    createdAt: {
        type:Date,
        default: Date.now()
    },
        

})

export default  model('message', messageSchema);
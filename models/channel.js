import { Schema, model, Types, SchemaTypes } from "mongoose";

const channelSchema = new Schema({
    id: {
        type: SchemaTypes.Number,
        required: true
    },
    guild: {
        type: Types.ObjectId,
        ref: 'guild' 
    },
    guildID: {
        type: SchemaTypes.Number,
        required: true
    },
    name: {
        type: SchemaTypes.String,
        required: true
    },
    lastMessageId: {
        type: SchemaTypes.Number
    },
    type: {
        type: SchemaTypes.Number
    }
}, { timestamps: true });

export default model('channel', channelSchema); 

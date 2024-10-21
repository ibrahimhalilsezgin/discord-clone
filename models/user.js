import { Schema, model,Types } from "mongoose";

const userSchema = new Schema({
    id:{
        type:Number
    },
    username: {
        type: String,
        required:true
    },
    displayName: {
        type: String,
        required:true,
        default:'Discord User'
    },
    email: {
        type: String,
        required:true

    },
    password: {
        type: String,
        trim:true,
        minlength:6,
        required:true
      },
    profilePhoto:{
        type:String,
        default:"data:image/png;base64,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"
    },
    bio: {
        type: String,
    },
    guilds: [{
        type:Types.ObjectId,
        ref: 'guild'
    }],
    lastHeartbeat: {
        type:Date,
        default: null
    }
    
})

export default model('user', userSchema);
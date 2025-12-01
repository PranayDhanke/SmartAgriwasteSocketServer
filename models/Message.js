import mongoose, { Schema } from "mongoose";


const chatModel = new Schema({
    message : { type: String, required: true }, 
    userid : { type: String, required: true },
    username : { type: String, required: true },

},{
    timestamps: true,
    
})

const Messages = mongoose.models.Messages || mongoose.model("Messages", chatModel);

export default Messages;
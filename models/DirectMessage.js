const mongoose = require('mongoose')

const directMessageSchema = new mongoose.Schema({
    from:{ 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users' ,
        required:true
    },
    to: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users' ,
        required:true
    },
    
    message: mongoose.Schema.Types.Mixed,


}, { timestamps: true })


const DirectMessage = mongoose.model('directMessage', directMessageSchema)
module.exports = DirectMessage
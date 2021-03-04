const mongoose = require('mongoose')

const teamMessageSchema = new mongoose.Schema({
    from:{ 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' ,
        required:true
    },
    to: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project' ,
        required:true
    },
    
    message: mongoose.Schema.Types.Mixed,


}, { timestamps: true })


const TeamMessage = mongoose.model('teamMessage', teamMessageSchema)
module.exports = TeamMessage
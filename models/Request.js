const mongoose = require('mongoose')

const requestSchema = new mongoose.Schema({
    from:{ type: mongoose.Schema.Types.ObjectId, ref: 'Users' , required:true},
    to:{ type: mongoose.Schema.Types.ObjectId, ref: 'Users', required:true},
    status: String,
    for:{ type: mongoose.Schema.Types.ObjectId, ref: 'project', required:true},
    offer: {type:Number }


}, { timestamps: true })


const Request = mongoose.model('request', requestSchema)
module.exports = Request
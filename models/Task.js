const mongoose = require('mongoose')

const taskSchema = new mongoose.Schema({
    userAssigned:{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required:true},
    status: String,
    project:{ type: mongoose.Schema.Types.ObjectId, ref: 'Project', required:true},
    task: {type:String , required:true},
    description: {type:String , required:true}


}, { timestamps: true })


const Task = mongoose.model('task', taskSchema)
module.exports = Task
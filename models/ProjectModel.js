const mongoose = require('mongoose')

const projectSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    projectOwner: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' , required:true},
    teamLeader:{ type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
    teamMembers:[{ type: mongoose.Schema.Types.ObjectId, ref: 'Users'}],
    Task:[{ type: mongoose.Schema.Types.ObjectId, ref: 'Task'}],
    duration: {
        type: String,
    },
    startedDate: {
        type: String,
    }


}, { timestamps: true })


const Project = mongoose.model('project', projectSchema)
module.exports = Project
var express = require('express');
var router = express.Router();
const User = require('../models/UserModel')
const Project = require('../models/ProjectModel')
const jwt = require("jsonwebtoken");
require("dotenv").config();
const Request = require('../models/Request')
const Task = require('../models/Task')

router.post('/create', (req, res) => {


  const { name, description, duration, startedDate } = req.body; //end // send as date 

  jwt.verify(req.headers.token, process.env.JWTSecret, (err, decode) => {
    if (err) return res.json({ msg: err });


    const projectOwner = decode.user._id;

    // Project.create({name,description,projectOwner,duration,startedDate}).then((error,data)=>{
    //   if(error){
    //   res.json({data:error})}
    //   else{
    //   User.findByIdAndUpdate(projectOwner,{$addToSet:{project: data._id}})
    //   .then(pro=>console.log(pro))
    //   .catch(err=>console.log(err))
    //   res.json(data)}
    // })

    Project.create({ name, description, projectOwner, duration, startedDate }).then(newProject => {
      // console.log("new Project",newProject);
      User.findOneAndUpdate({ _id: projectOwner }, { $addToSet: { project: newProject._id } })
      .then(user => {
        console.log("user ", user);
        let userUpdate = user.populate("project")
        res.json(newProject)
      })
    }).catch(err => console.log(err))




  });

})

router.post("/user/:userId/sendRequest",(req,res)=>{

console.log(req.body)
console.log(req.params.userId)

  jwt.verify(req.headers.token, process.env.JWTSecret, (err, decode) => {
    if (err) return res.json({ msg: "unautherized access" });

    let user = decode.user;
    console.log(user)
    if(user._id.toString() == req.params.userId){
      return res.json({ msg: "you cannot send request to yourself" });
    }

    User.find({_id:req.params.userId},(err,result)=>{
      if(err) return res.json({ msg: "user does not exist" })

      if (result.userType == user.userType) return res.json({ msg: "you cannot send offer to the same user type" })
      console.log(req.body.id)
      Request.create({ from: user._id, to: req.params.userId, status: "waiting", for: req.body.id, offer: 500 }).then(ele=>{
        res.json({msg:"done !!"})
      })
    })


  });

})


router.post("/:id/user/:userId/accepet", (req, res) => {
  jwt.verify(req.headers.token, process.env.JWTSecret, (err, decode) => {
    if (err) return res.json({ msg: "unautherized access" });

    let user = decode.user;

    Request.findOneAndDelete({ from: req.params.userId, to: user._id, for: req.params.id }, (err, result) => {

      if (user.userType == "Freelancer") {

        Project.findByIdAndUpdate(req.params.id, { $addToSet: { teamMembers: user._id } }).then((data) => {
          User.findByIdAndUpdate(user._id, { $addToSet: {  project: data._id } }).then((data) => {
            res.json({data})
          })
        })

      }
      else {

        Project.findByIdAndUpdate(req.params.id, { $addToSet: { teamMembers: req.params.userId } }).then((data) => {
          User.findByIdAndUpdate(req.params.userId, { $addToSet: { project: data._id }}).then((data) => {
            res.json({data})
          })
        })

      }

    })

  });

})


router.post("/:id/user/:userId/refuse", (req, res) => {
  console.log("req.params.userId",req.params.userId)
  console.log("req.params.id",req.params.id)
  jwt.verify(req.headers.token, process.env.JWTSecret, (err, decode) => {
    if (err) return res.json({ msg: "unautherized access" });

    let user = decode.user;
    console.log(user)
    Request.findOneAndDelete({  _id: req.params.id }, (err, result) => { 
      console.log(err)
      console.log("result",result)
      res.json({err})
    })



  });

})



router.post("/team/:id/assigntask",(req,res)=>{
  console.log(req.headers.token)
  jwt.verify(req.headers.token, process.env.JWTSecret, (err, decode) => {
    if (err) return res.json({ msg: "unautherized access" });
    let user = decode.user;
    
    Project.find({_id:req.params.id},(err,result)=>{
      Task.create({userAssigned:req.body.userId,status:"working on",project:req.params.id,task:req.body.task,description:req.body.description}).then(data=>{
        res.json({msg:"done"})
      })
    })
  });
})




router.get('/all',async (req,res)=>{
  var projects = await Project.find().populate("teamMembers","-password").populate("projectOwner","-password")
  res.json({projects})
})

router.get('/user/:id/allrequest',async (req,res)=>{
  var requests = await Request.find({to: req.params.id}).populate("for").populate("from")
  res.json({requests})
})


router.get('/team/:id/task', (req,res)=>{
   console.log(req.headers.token)
  jwt.verify(req.headers.token, process.env.JWTSecret, (err, decode) => {
   
  Task.find({project:req.params.id,userAssigned:decode.user._id}).then(tasks=>{

    res.json(tasks)
  })
  

});
})

router.get('/id/:id',async (req,res)=>{

  var project = await Project.findById(req.params.id).populate("projectOwner","-password").populate("teamMembers","-password")
  // console.log(project)
  res.json(project)

})

router.get('/user/:id/projects',async (req,res)=>{

  var project = await Project.find({projectOwner:req.params.id})
  res.json({project})

})

router.get('/user/:id/allrequest',async (req,res)=>{
  console.log(req.params.id)
  var requests = await Request.find({to: req.params.id}).populate("for")
  res.json({requests})
})

module.exports = router;

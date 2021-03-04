var express = require('express');
var router = express.Router();
const User = require('../models/UserModel')
const Request = require('../models/UserModel')
const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt');
require("dotenv").config();
const multer = require('multer');
var path = require("path");

// define the storage where the file will be stored
const imgStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    // it should be inside the public dir
    cb(null, 'public/uploads/img')
  },
  // renaming the file and adding the ext, you can get the ext from the file directly
  filename: function (req, file, cb) {
    
    cb(null, file.fieldname + '-' + Date.now()+'.png')
  }
})


const cvStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    // it should be inside the public dir
    cb(null,"public/uploads/cv")
  },
  // renaming the file and adding the ext, you can get the ext from the file directly
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-'+ Date.now() +'.pdf')
  }
})


var uploadImg = multer({ storage: imgStorage })
var uploadCV = multer({ storage: cvStorage })


/* GET users listing. */
router.get('/', function (req, res, next) {

  res.send('respond with a resource');

});

router.post('/signup', function (req, res, next) {
  console.log(req.body)

  var firstName = req.body.firstName;
  var lastName = req.body.lastName;
  var gender = req.body.gender;
  var email = req.body.email;
  var password = req.body.password;
  var type = req.body.type;
  

  User.createSecure(firstName, lastName, email, password, type, gender, (err, user) => {

    if (err) {

      res.status(500).json({ msg: err })

    } else {

      res.json({ msg: "registeration confiremed" })

    }

  })


});

router.post('/signin', function (req, res, next) {


  User.authenticate(req.body.email, req.body.password, (err, user) => {

    if (err) {
      res.json({ msg: "email or password is not correct" })
    } else {

      user.password = undefined;
      let payload = {user};
      let token = jwt.sign(payload, process.env.JWTSecret, {
        expiresIn: 1000 * 60 * 60,
      }); // to the user info

      
      res.json({ msg: "user login ", token,user });


    }
  })
});

router.put('/editprofile', function (req, res, next) {

  const { firstName, lastName, img, bio, speciality } = req.body;

  const newInfo = { firstName, lastName, img, bio, speciality }

  for (const property in newInfo) {
    if (newInfo[property] == "") {
      delete newInfo[property]
    }
  }

  jwt.verify(req.headers.token, process.env.JWTSecret, (err, decode) => {
    if (err) return res.json({ msg: err });

    let user = decode.user;


    User.findOneAndUpdate({ _id: user._id }, newInfo)
      .then((err) => {
        console.log(newInfo)
        res.json({ msg: "update done" })
      })


  });

});



router.put('/addskill', function (req, res, next) {




  jwt.verify(req.headers.token, process.env.JWTSecret, (err, decode) => {
    if (err) return res.json({ msg: err });

    let user = decode.user;


    User.findOneAndUpdate({ _id: user._id }, {$addToSet:{skills:req.body.skill}})
      .then((err) => {
        console.log(newInfo)
        res.json({ msg: "update done" })
      })


  });

});


router.post('/removeskill', function (req, res, next) {


console.log(req.body.skill)

  jwt.verify(req.headers.token, process.env.JWTSecret, (err, decode) => {
    if (err) return res.json({ msg: err });

    let user = decode.user;


    User.findOneAndUpdate({ _id: user._id }, {$pull:{skills:req.body.skill}})
      .then((err) => {
        
        res.json({ msg: "update done" })
      })


  });

});


router.put('/addqualification', function (req, res, next) {

  jwt.verify(req.headers.token, process.env.JWTSecret, (err, decode) => {
    if (err) return res.json({ msg: err });

    let user = decode.user;

    User.findOneAndUpdate({ _id: user._id }, {$addToSet:{qualification:req.body.qualification}})
      .then((err) => {
        console.log(newInfo)
        res.json({ msg: "update done" })
      })


  });

});


router.post('/removequalification', function (req, res, next) {

console.log(req.body.qualification)

  jwt.verify(req.headers.token, process.env.JWTSecret, (err, decode) => {
    if (err) return res.json({ msg: err });

    let user = decode.user;

    User.findOneAndUpdate({ _id: user._id }, {$pull:{qualification:req.body.qualification}})
      .then((err) => {
        
        res.json({ msg: "update done" })
      }).catch(err=>console.log(err))


  });

});

router.post("/changepassword", (req, res) => {

  jwt.verify(req.headers.token, process.env.JWTSecret, (err, decode) => {
    if (err) return res.json({ msg: err });

    let user = decode.user;

    bcrypt.genSalt(function (err, salt) {
      bcrypt.hash(req.body.password, salt, function (err, hash) {

        User.findOneAndUpdate({ _id: user._id }, { password: hash })
          .then((err) => {

            res.json({ msg: "change password done" })
          })


      })

    })

  });


})


router.post('/upload/cv',uploadCV.single('cv'), function (req, res, next) {
  
  jwt.verify(req.headers.token, process.env.JWTSecret, (err, decode) => {
    if (err) return res.json({ msg: err });
    console.log('/uploads/cv/' + req.file.filename )

    let user = decode.user;
    
    console.log(user._id )

    User.findOneAndUpdate({_id:user._id},{CV: '/uploads/cv/' + req.file.filename }).then(data=>console.log(data)).catch(err=>console.log(err))
  });

});

router.post('/upload/img',uploadImg.single('img'), function (req, res, next) {

  jwt.verify(req.headers.token, process.env.JWTSecret, (err, decode) => {
    if (err) return res.json({ msg: err });

    
    let user = decode.user;

    User.findByIdAndUpdate(user._id,{img: '/uploads/img/' + req.file.filename}).then(data=>console.log(data)).catch(err=>console.log(err))

  });

});

router.get('/all', async (req, res) => {
  var arrayOfData = await User.find().populate("project")
  var users = arrayOfData.map((ele) => {
    ele.password = undefined
    return ele
  })
  res.json({ users })
})

/// api/users/
router.get('/freelance/:id', async (req, res) => {
  console.log()
  var freelance = await User.findOne({ _id: req.params.id, userType: "freelancer" })
  freelance.password = undefined
  res.json({ freelance })
})

router.get('/client/:id', async (req, res) => {
  var client = await User.findOne({ _id: req.params.id, userType: "client" })
  client.password = undefined
  res.json({ client })
})

router.get('/clients', async (req, res) => {
  var arrayOfData = await User.findOne({ userType: "client" })
  var clients = arrayOfData.map((ele) => {
    ele.password = undefined
    return ele
  })
  res.json({ clients })
})

router.get('/freelancers', async (req, res) => {
  var arrayOfData = await User.find({ userType: "freelancer" })

  var freelancers = arrayOfData.map((ele) => {
    ele.password = undefined
    return ele
  })

  res.json({ freelancers })
})


router.put('/freelance/:id/rate', (req, res) => {
  User.findByIdAndUpdate(req.params.id, { $push: { rating: req.body.rate } })
  res.json({ msg: "rating done" })
})


module.exports = router;

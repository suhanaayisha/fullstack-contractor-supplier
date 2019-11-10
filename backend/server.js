const path = require('path')
const express = require('express')
var cors = require('cors');
const logger = require('morgan');
const mongoose = require('mongoose')
const bodyParser = require('body-parser') // to collect data from browser
const Data = require('./data');
const userData = require('./user');
const requestData = require('./request');
const bidData = require('./bid')

const API_PORT = 3001;
const app = new express();
app.use(cors());
const router = express.Router();

const dbRoute =
  'mongodb+srv://admin:admin@cluster0-ezyo5.mongodb.net/test?retryWrites=true&w=majority';

// connects our back end code with the database
mongoose.connect(dbRoute, { useNewUrlParser: true });

// mongoose.connect('mongodb://localhost/fullstack-app')

let db = mongoose.connection;

coll = db.requests

db.once('open', () => console.log('connected to the database'));

db.on('error', console.error.bind(console, 'MongoDB connection error:'));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(logger('dev'));

router.get('/getData', (req, res) => {
    Data.find((err, data) => {
      if (err) return res.json({ success: false, error: err });
      return res.json({ success: true, data: data });
    });
});


router.get('/getUserData', async (req, res) => {
  const users = await userData.find((err, data) => {
      if (err) return res.json({ success: false, error: err });
      return res.json({ success: true, data: data });
    });
  console.log(users)
});

router.get('/getRequestData', async (req, res) => {
  const requests = await requestData.find((err, data) => {
      if (err) return res.json({ success: false, error: err });
      return res.json({ success: true, data: data });
    });
  // console.log(requests)
});

router.get('/getBidData', async (req, res) => {
  const requests = await bidData.find((err, data) => {
      if (err) return res.json({ success: false, error: err });
      return res.json({ success: true, data: data });
    });
  // console.log(requests)
});


  router.post('/updateBidData', (req, res) => {
    const { id, update } = req.body;
    Data.findByIdAndUpdate(id, update, (err) => {
      if (err) return res.json({ success: false, error: err });
      return res.json({ success: true });
    });
  });

router.delete('/deleteRequestData', (req, res) => {
    const { id } = req.body;
    console.log("reaches here")
    // console.log(requestData.findById(id))
    requestData.findByIdAndRemove(id, (err) => {
      if (err) return res.send(err);
      return res.json({ success: true });
    });
  });

router.post('/deleteBidData', (req, res) => {
    const { id } = req.body;
    bidData.findByIdAndRemove(id, (err) => {
      if (err) return res.send(err);
      return res.json({ success: true });
    });
  });


  router.post('/putData', (req, res) => {
    console.log("coming here")
    let data = new Data();
  
    const { id, message } = req.body;
  
    if ((!id && id !== 0) || !message) {
      return res.json({
        success: false,
        error: 'INVALID INPUTS',
      });
    }
    data.message = message;
    data.id = id;
    data.save((err) => {
      if (err) return res.json({ success: false, error: err });
      return res.json({ success: true });
    });
  });

  router.post('/putUserData', (req, res) => {
    // console.log("coming here")
    let data = new userData();
  
    const {  username, password, usertype } = req.body;
  
    
    data.username = username;
    data.password = password;
    data.usertype = usertype
    data.save((err) => {
      if (err) return res.json({ success: false, error: err });
      return res.json({ success: true });
    });
  });

  router.post('/putRequestData', (req, res) => {
    // console.log("coming here")
    let data = new requestData();
  
    const {  userid, username, equip, quantity } = req.body;
    data.username= username;
    data.userid= userid;
    data.equip = equip;
    data.quantity = quantity;
    data.save((err) => {
      if (err) return res.json({ success: false, error: err });
      return res.json({ success: true });
    });
  });

  router.post('/putBidData', (req, res) => {
    // console.log("coming here")
    let data = new bidData();
  
    const {  reqid, price} = req.body;
  
    
    data.reqid = reqid;
    data.price = price;
    data.save((err) => {
      if (err) return res.json({ success: false, error: err });
      return res.json({ success: true });
    });
  });

  app.use('/api', router);

  app.listen(API_PORT, () => console.log(`LISTENING ON PORT ${API_PORT}`));
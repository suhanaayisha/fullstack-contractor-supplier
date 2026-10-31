const path = require('path')
const express = require('express')
var cors = require('cors');
const logger = require('morgan');
const mongoose = require('mongoose')
require('dotenv').config({ path: path.join(__dirname, '../.env.development') })
const bodyParser = require('body-parser') // to collect data from browser

const ENV = process.env.NODE_ENV;
const API_PORT = process.env.PORT || 3001;

const app = new express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.listen(API_PORT, () => console.log(`LISTENING ON PORT ${API_PORT}`))

const Data = require('./data');
const userData = require('./schema/user');
const requestData = require('./schema/request');
const bidData = require('./schema/bid')

app.use(cors());
const router = express.Router();

const dbRoute =process.env.MONGODB_URI;

// connects our back end code with the database
mongoose.connect(dbRoute);

// mongoose.connect('mongodb://localhost/fullstack-app')

let db = mongoose.connection;

coll = db.requests

db.once('open', () => console.log('connected to the database'));

db.on('error', console.error.bind(console, 'MongoDB connection error:'));

app.use(logger('dev'));


router.get('/getData', (req, res) => {
    Data.find()
    .then((data) => res.json({ success: true, data: data }))
    .catch((err) => res.json({ success: false, error: err }));
});


router.get('/getUserData', async (req, res) => {
  userData.find()
    .then((data) => res.json({ success: true, data: data }))
    .catch((err) => res.json({ success: false, error: err }));
});

router.get('/getRequestData', async (req, res) => {
  requestData.find()
    .then((data) => res.json({ success: true, data: data }))
    .catch((err) => res.json({ success: false, error: err }));
  // console.log(requests)
});

router.get('/getBidData', async (req, res) => {
  bidData.find()
    .then((data) => res.json({ success: true, data: data }))
    .catch((err) => res.json({ success: false, error: err }));
  // console.log(requests)
});


  router.post('/updateBidData', (req, res) => {
    const { id, update } = req.body;
    Data.findByIdAndUpdate(id, update)
      .then(() => res.json({ success: true }))
      .catch((err) => res.json({ success: false, error: err }));
  });

router.delete('/deleteRequestData', (req, res) => {
    const { id } = req.body;
    console.log("reaches here")
    // console.log(requestData.findById(id))
    requestData.findByIdAndDelete(id)
      .then(() => res.json({ success: true }))
      .catch((err) => res.send(err));
  });

router.post('/deleteBidData', (req, res) => {
    const { id } = req.body;
    bidData.findByIdAndDelete(id)
      .then(() => res.json({ success: true }))
      .catch((err) => res.send(err));
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
    data.save()
      .then(() => res.json({ success: true }))
      .catch((err) => res.json({ success: false, error: err }));
  });

  router.post('/putUserData', (req, res) => {
    // console.log("coming here")
    let data = new userData();
  
    const {  username, password, usertype } = req.body;
  
    
    data.username = username;
    data.password = password;
    data.usertype = usertype
    data.save()
      .then(() => res.json({ success: true }))
      .catch((err) => res.json({ success: false, error: err }));
  });

  router.post('/putRequestData', (req, res) => {
    // console.log("coming here")
    let data = new requestData();
  
    const {  userid, username, equip, quantity } = req.body;
    data.username= username;
    data.userid= userid;
    data.equip = equip;
    data.quantity = quantity;
    data.save()
      .then(() => res.json({ success: true }))
      .catch((err) => res.json({ success: false, error: err }));
  });

  router.post('/putBidData', (req, res) => {
    // console.log("coming here")
    let data = new bidData();
  
    const {  reqid, price} = req.body;
  
    
    data.reqid = reqid;
    data.price = price;
    data.save()
      .then(() => res.json({ success: true }))
      .catch((err) => res.json({ success: false, error: err }));
  });

  app.use('/api', router);

  if(ENV==='production'){
    app.use(express.static(path.join(__dirname, '../client/build')));
    app.use((req, res)=> {
      
         res.sendFile(path.join(__dirname, '../client/build/index.html'));
      
      });
  }

  module.exports = app;
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
const equipmentData = require('./schema/equipment');

const DEFAULT_EQUIPMENT = [
  'Backhoe Loader',
  'Bulldozer',
  'Cement Mixer',
  'Compactor',
  'Concrete Pump',
  'Crane',
  'Dump Truck',
  'Excavator',
  'Forklift',
  'Generator',
  'Scaffolding',
  'Skid Steer Loader',
];

// fill the equipment collection the first time the app runs against a database
const seedEquipment = async () => {
  if (await equipmentData.countDocuments() === 0) {
    await equipmentData.insertMany(DEFAULT_EQUIPMENT.map((name) => ({ name })));
    console.log('seeded equipment list');
  }
};

app.use(cors());
const router = express.Router();

const dbRoute =process.env.MONGODB_URI;

// connects our back end code with the database
mongoose.connect(dbRoute);

// mongoose.connect('mongodb://localhost/fullstack-app')

let db = mongoose.connection;

coll = db.requests

db.once('open', () => {
  console.log('connected to the database');
  seedEquipment().catch((err) => console.error('equipment seed failed:', err));
});

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

// ?userid=... returns only that contractor's requests
router.get('/getRequestData', async (req, res) => {
  const filter = req.query.userid ? { userid: req.query.userid } : {};
  requestData.find(filter)
    .then((data) => res.json({ success: true, data: data }))
    .catch((err) => res.json({ success: false, error: err }));
  // console.log(requests)
});

router.get('/getEquipment', (req, res) => {
  equipmentData.find().sort({ name: 1 })
    .then((data) => res.json({ success: true, data: data }))
    .catch((err) => res.json({ success: false, error: err }));
});

// ?supplierid=... returns only that supplier's bids
// ?contractorid=... returns the bids placed on that contractor's requests
router.get('/getBidData', async (req, res) => {
  try {
    let filter = {};
    if (req.query.supplierid) {
      filter = { supplierid: req.query.supplierid };
    } else if (req.query.contractorid) {
      const requests = await requestData.find({ userid: req.query.contractorid }, '_id');
      filter = { reqid: { $in: requests.map((request) => String(request._id)) } };
    }
    const data = await bidData.find(filter).sort({ createdAt: 1 });
    res.json({ success: true, data: data });
  } catch (err) {
    res.json({ success: false, error: err });
  }
});

// contractor accepts or rejects a bid on one of their requests;
// accepting rejects the other pending bids and closes the request
router.post('/updateBidStatus', async (req, res) => {
  const { id, status, userid } = req.body;
  if (!['accepted', 'rejected'].includes(status)) {
    return res.json({ success: false, error: 'Status must be accepted or rejected' });
  }
  try {
    const bid = await bidData.findById(id);
    const request = bid && await requestData.findOne({ _id: bid.reqid, userid: userid });
    if (!request) return res.json({ success: false, error: 'Bid not found' });
    if (request.status === 'closed') return res.json({ success: false, error: 'This request is already closed' });

    bid.status = status;
    await bid.save();
    if (status === 'accepted') {
      await bidData.updateMany({ reqid: bid.reqid, _id: { $ne: bid._id } }, { status: 'rejected' });
      request.status = 'closed';
      await request.save();
    }
    res.json({ success: true });
  } catch (err) {
    res.json({ success: false, error: err });
  }
  // console.log(requests)
});


  router.post('/updateBidData', (req, res) => {
    const { id, update } = req.body;
    Data.findByIdAndUpdate(id, update)
      .then(() => res.json({ success: true }))
      .catch((err) => res.json({ success: false, error: err }));
  });

router.delete('/deleteRequestData', (req, res) => {
    const { id, userid } = req.body;
    // only the contractor who made the request can delete it, along with any bids placed on it
    requestData.findOneAndDelete({ _id: id, userid: userid })
      .then((request) => {
        if (!request) return res.json({ success: false, error: 'Request not found' });
        return bidData.deleteMany({ reqid: id }).then(() => res.json({ success: true }));
      })
      .catch((err) => res.json({ success: false, error: err }));
  });

router.post('/deleteBidData', (req, res) => {
    const { id, supplierid } = req.body;
    // only the supplier who placed the bid can delete it
    // accepted bids are kept as a record of the deal
    bidData.findOneAndDelete({ _id: id, supplierid: supplierid, status: { $ne: 'accepted' } })
      .then((bid) => res.json(bid ? { success: true } : { success: false, error: 'Bid not found' }))
      .catch((err) => res.json({ success: false, error: err }));
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
  
    const {  userid, username, equip, quantity, requiredBy } = req.body;
    data.username= username;
    data.userid= userid;
    data.equip = equip;
    data.quantity = quantity;
    data.requiredBy = requiredBy;
    data.save()
      .then(() => res.json({ success: true }))
      .catch((err) => res.json({ success: false, error: err }));
  });

  router.post('/putBidData', (req, res) => {
    // console.log("coming here")
    let data = new bidData();
  
    const {  reqid, price, supplierid, suppliername } = req.body;

    if (!reqid || !(Number(price) > 0)) {
      return res.json({ success: false, error: 'A bid needs a request and a price greater than 0' });
    }

    data.reqid = reqid;
    data.price = price;
    data.supplierid = supplierid;
    data.suppliername = suppliername;
    requestData.findById(reqid)
      .then((request) => {
        if (!request || request.status === 'closed') {
          return res.json({ success: false, error: 'This request is no longer open for bids' });
        }
        return data.save().then((bid) => res.json({ success: true, data: bid }));
      })
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
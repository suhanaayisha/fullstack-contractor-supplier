const path = require('path')
const express = require('express')
var cors = require('cors');
const logger = require('morgan');
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
require('dotenv').config({ path: path.join(__dirname, '../.env.development') })
const bodyParser = require('body-parser') // to collect data from browser

const ENV = process.env.NODE_ENV;
const API_PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET;
const TOKEN_LIFETIME = '7d';

if (!JWT_SECRET) {
  console.error('JWT_SECRET is not set. Add it to .env.development (or your host\'s environment variables).');
  process.exit(1);
}

const app = new express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.listen(API_PORT, () => console.log(`LISTENING ON PORT ${API_PORT}`))

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

db.once('open', () => {
  console.log('connected to the database');
  seedEquipment().catch((err) => console.error('equipment seed failed:', err));
});

db.on('error', console.error.bind(console, 'MongoDB connection error:'));

app.use(logger('dev'));




const SALT_ROUNDS = 10;
const USER_TYPES = ['contractor', 'supplier'];

// reads "Authorization: Bearer <token>" and puts the logged-in user on req.user
const requireAuth = (req, res, next) => {
  const [scheme, token] = (req.headers.authorization || '').split(' ');
  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ success: false, error: 'not_logged_in' });
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = { userid: payload.sub, username: payload.username, usertype: payload.usertype };
    next();
  } catch (err) {
    res.status(401).json({ success: false, error: 'session_expired' });
  }
};

const requireRole = (usertype) => (req, res, next) => {
  if (req.user.usertype !== usertype) {
    return res.status(403).json({ success: false, error: `Only ${usertype}s can do this` });
  }
  next();
};
const isBcryptHash = (value) => typeof value === 'string' && /^\$2[aby]\$/.test(value);

// never send passwords (or their hashes) to the browser
router.get('/getUserData', async (req, res) => {
  userData.find({}, '-password')
    .then((data) => res.json({ success: true, data: data }))
    .catch((err) => res.json({ success: false, error: err }));
});

// checks the password on the server and returns the user without their password
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await userData.findOne({ username: username });
    if (!user) return res.json({ success: false, error: 'user_not_found' });

    let passwordOk;
    if (isBcryptHash(user.password)) {
      passwordOk = await bcrypt.compare(password || '', user.password);
    } else {
      // account created before passwords were hashed: compare once, then upgrade it to a hash
      passwordOk = user.password === password;
      if (passwordOk) {
        user.password = await bcrypt.hash(password, SALT_ROUNDS);
        await user.save();
      }
    }
    if (!passwordOk) return res.json({ success: false, error: 'wrong_password' });

    const token = jwt.sign(
      { username: user.username, usertype: user.usertype },
      JWT_SECRET,
      { subject: String(user._id), expiresIn: TOKEN_LIFETIME }
    );
    res.json({ success: true, data: { token, userid: user._id, username: user.username, usertype: user.usertype } });
  } catch (err) {
    res.json({ success: false, error: 'Login failed' });
  }
});

// contractors get their own requests; suppliers get everyone's, to bid on
router.get('/getRequestData', requireAuth, async (req, res) => {
  const filter = req.user.usertype === 'contractor' ? { userid: req.user.userid } : {};
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

// suppliers get their own bids; contractors get the bids placed on their requests
router.get('/getBidData', requireAuth, async (req, res) => {
  try {
    let filter;
    if (req.user.usertype === 'supplier') {
      filter = { supplierid: req.user.userid };
    } else {
      const requests = await requestData.find({ userid: req.user.userid }, '_id');
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
router.post('/updateBidStatus', requireAuth, requireRole('contractor'), async (req, res) => {
  const { id, status } = req.body;
  const userid = req.user.userid;
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



router.delete('/deleteRequestData', requireAuth, requireRole('contractor'), (req, res) => {
    const { id } = req.body;
    const userid = req.user.userid;
    // only the contractor who made the request can delete it, along with any bids placed on it
    requestData.findOneAndDelete({ _id: id, userid: userid })
      .then((request) => {
        if (!request) return res.json({ success: false, error: 'Request not found' });
        return bidData.deleteMany({ reqid: id }).then(() => res.json({ success: true }));
      })
      .catch((err) => res.json({ success: false, error: err }));
  });

router.post('/deleteBidData', requireAuth, requireRole('supplier'), (req, res) => {
    const { id } = req.body;
    const supplierid = req.user.userid;
    // only the supplier who placed the bid can delete it
    // accepted bids are kept as a record of the deal
    bidData.findOneAndDelete({ _id: id, supplierid: supplierid, status: { $ne: 'accepted' } })
      .then((bid) => res.json(bid ? { success: true } : { success: false, error: 'Bid not found' }))
      .catch((err) => res.json({ success: false, error: err }));
  });



  router.post('/putUserData', (req, res) => {
    // console.log("coming here")
    let data = new userData();
  
    const {  username, password, usertype } = req.body;

    if (!username || !password) {
      return res.json({ success: false, error: 'Username and password are required' });
    }
    if (!USER_TYPES.includes(usertype)) {
      return res.json({ success: false, error: 'User type must be contractor or supplier' });
    }

    data.username = username;
    data.usertype = usertype
    bcrypt.hash(password, SALT_ROUNDS)
      .then((hash) => {
        data.password = hash;
        return data.save();
      })
      .then(() => res.json({ success: true }))
      .catch((err) => res.json({ success: false, error: err }));
  });

  router.post('/putRequestData', requireAuth, requireRole('contractor'), (req, res) => {
    let data = new requestData();

    const { equip, quantity, requiredBy } = req.body;
    data.username= req.user.username;
    data.userid= req.user.userid;
    data.equip = equip;
    data.quantity = quantity;
    data.requiredBy = requiredBy;
    data.save()
      .then(() => res.json({ success: true }))
      .catch((err) => res.json({ success: false, error: err }));
  });

  router.post('/putBidData', requireAuth, requireRole('supplier'), (req, res) => {
    let data = new bidData();

    const { reqid, price } = req.body;
    const supplierid = req.user.userid;
    const suppliername = req.user.username;

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
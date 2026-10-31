const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// this will be our data base's data structure 
const DataSchema = new Schema(
  {
    reqid: String,
    supplierid: String,
    suppliername: String,
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
    price: String,
  },
  { timestamps: true }
);

// export the new Schema so we could modify it using Node.js
module.exports = mongoose.model("bid", DataSchema);
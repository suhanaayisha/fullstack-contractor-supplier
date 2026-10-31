const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// this will be our data base's data structure 
const DataSchema = new Schema(
  {
    userid: String,
    username: String,  
    equip: String,
    quantity: Number,
    requiredBy: Date,
    // closed once the contractor accepts a bid
    status: { type: String, enum: ['open', 'closed'], default: 'open' },
  },
  { timestamps: true }
);

// export the new Schema so we could modify it using Node.js
module.exports = mongoose.model("request", DataSchema);
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// equipment that contractors can pick from when making a request
const EquipmentSchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("equipment", EquipmentSchema);

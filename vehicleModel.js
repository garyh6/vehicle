const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema(
  {
    id: String,
    x: Number,
    y: Number,
    temperature: Number,
    dev: String,
    prod: String,
    properties: {}
  },
  { collection: "properties" }
);

module.exports = mongoose.model("Vehicle", vehicleSchema);

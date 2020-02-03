const express = require("express");
const router = express.Router();
const Vehicle = require("./vehicleModel");

const getVehicle = async (req, res, next) => {
  let vehicle;
  try {
    vehicle = await Vehicle.findById(req.params.id);
    if (vehicle == null) {
      return res.status(404).json({ message: "Cannot find vehicle" });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }

  res.vehicle = vehicle;
  next();
};

const checkImmutableKeys = (req, res, next) => {
  const imList = Object.keys(res.vehicle._doc);
  if (imList.includes(req.body.key))
    return res.status(400).json({ message: "Denied" });
  next();
};

// Get all Vehicles
router.get("/", async (req, res) => {
  try {
    const vehicles = await Vehicle.find();
    res.json(vehicles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update Properties of Vehicle
router.patch("/:id", getVehicle, checkImmutableKeys, async (req, res) => {
  console.log("************ update endpoint");
  const key = req.body.key;
  const value = req.body.value;
  if (key === null && value === null) {
    return res.status(400).json({ message: "Invalid Input" });
  }

  res.vehicle.properties[key] = value;

  try {
    res.vehicle.markModified("properties");
    const updatedVehicle = await res.vehicle.save();
    res.json(updatedVehicle);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete Properties of Vehicle
router.delete("/:id", getVehicle, checkImmutableKeys, async (req, res) => {
  const key = req.body.key;
  if (key != null) {
    delete res.vehicle.properties[key];
  }

  try {
    res.vehicle.markModified("properties");
    const updatedVehicle = await res.vehicle.save();
    res.json(updatedVehicle);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Actual Vehical Values
// only one vehicle - doing getVehicle is kinda dumb
router.patch(
  "/:id/internal",
  getVehicle,
  async ({ body: { temperature, x, y } }, res) => {
    console.log("************ updating vehicle");
    res.vehicle.temperature = temperature;
    res.vehicle.x = x;
    res.vehicle.y = y;

    try {
      // res.vehicle.markModified("properties");
      const updatedVehicle = await res.vehicle.save();
      res.json(updatedVehicle);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }
);

module.exports = router;

require("dotenv").config();

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");

const whitelist = [
  `http://localhost:${process.env.SERVER_PORT}`,
  `http://127.0.0.1:${process.env.SERVER_PORT}`
];
const corsOptions = {
  origin: function(origin, callback) {
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  }
};
app.use(cors(corsOptions));
mongoose.connect(process.env.DATABASE_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
const db = mongoose.connection;
db.on("error", error => console.error(error));
db.once("open", () => console.log("Connected to Database"));

app.use(express.json());

const vehicleRouter = require("./routes");
app.use("/properties", vehicleRouter);

app.listen(process.env.SERVER_PORT, () =>
  console.log(`Server is running on localhost:${process.env.SERVER_PORT}`)
);

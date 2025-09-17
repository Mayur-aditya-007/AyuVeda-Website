//function to connect db called in app.js
const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
  mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Database Connected......."))
  .catch(err => console.error("Database Connection Error: ", err));
}

module.exports = connectDB;

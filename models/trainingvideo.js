const mongoose = require("mongoose");

const TrainingVideoSchema = new mongoose.Schema({
  id: {
    type: String,
    unique: true,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  category: {
    type: String,
  },
  description: {
    type: String,
    default: "",
  },
  url: {
    type: String,
    required: true,
  },
});

const TrainingVideo = mongoose.model("TrainingVideo", TrainingVideoSchema);

module.exports = TrainingVideo;

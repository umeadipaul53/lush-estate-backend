const mongoose = require("mongoose");

const faqQuestionSchema = new mongoose.Schema({
  heading: String,
  description: String,
  video: String,
});

const pastProjectSchema = new mongoose.Schema({
  beforeImage: String,
  afterImage: String,
});

const testimonialSchema = new mongoose.Schema({
  name: String,
  text: String,
  video: String,
});

// Dynamic “data” object depending on the stepType
const stepSchema = new mongoose.Schema(
  {
    stepType: {
      type: String,
      enum: [
        "whyEstate",
        "virtualInspection",
        "trustCredibility",
        "faq",
        "featuresAmenities",
        "locationAdvantage",
      ],
      required: true,
    },
    stepNumber: { type: Number, required: true },

    data: {
      heading: String,
      description: String,
      video: String,

      // Specific to virtualInspection & locationAdvantage
      mapUrl: String,

      // Step 3 fields
      certificates: [String],
      pastProjects: [pastProjectSchema],
      testimonials: [testimonialSchema],
      awards: [String],

      // Step 4 fields
      questions: [faqQuestionSchema],
    },
  },
  { timestamps: true }
);

const estateSchema = new mongoose.Schema(
  {
    estateName: { type: String, required: true, unique: true },
    steps: [stepSchema],
  },
  { timestamps: true }
);

const estateModel = mongoose.model("Estate", estateSchema);
module.exports = { estateModel };

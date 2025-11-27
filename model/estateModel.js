const mongoose = require("mongoose");

const faqQuestionSchema = new mongoose.Schema({
  heading: { type: String, required: true },
  description: { type: String, required: true },

  // FAQ question video is optional
  video: { type: [String], default: [] },
});

const pastProjectSchema = new mongoose.Schema({
  beforeImage: { type: String, required: true },
  afterImage: { type: String, required: true },
});

const testimonialSchema = new mongoose.Schema({
  name: { type: String, required: true },
  text: { type: String, required: true },

  // Testimonials MUST have at least 1 video
  video: {
    type: [String],
    required: true,
    validate: (v) => v.length > 0,
  },
});

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
      heading: { type: String, required: true },
      description: { type: String, required: true },

      // Step-level video is OPTIONAL, can accept multiple
      video: { type: [String], default: [] },

      mapUrl: { type: String },

      // Trust & Credibility
      certificates: { type: [String], default: [] },
      pastProjects: { type: [pastProjectSchema], default: [] },
      testimonials: { type: [testimonialSchema], default: [] },
      awards: { type: [String], default: [] },

      // FAQ questions
      questions: { type: [faqQuestionSchema], default: [] },
    },
  },
  { timestamps: true }
);

const estateSchema = new mongoose.Schema(
  {
    estateName: { type: String, required: true, unique: true },
    steps: { type: [stepSchema], default: [] },
  },
  { timestamps: true }
);

const estateModel = mongoose.model("Estate", estateSchema);
module.exports = { estateModel };

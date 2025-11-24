const Joi = require("joi");

// Common fields for all steps
const baseStepFields = {
  heading: Joi.string().required(),
  description: Joi.string().required(),
  video: Joi.string().uri().optional(),
};

// Step 1 & Step 5 share same structure
const stepWhyEstate = Joi.object({
  ...baseStepFields,
  video: Joi.string().uri().required(),
});

const stepFeaturesAmenities = Joi.object({
  ...baseStepFields,
  video: Joi.string().uri().required(),
});

// Step 2: Virtual Inspection
const stepVirtualInspection = Joi.object({
  ...baseStepFields,
  video: Joi.string().uri().required(),
  mapUrl: Joi.string().uri().required(),
});

// Step 3: Trust & Credibility
const stepTrustCredibility = Joi.object({
  ...baseStepFields,
  certificates: Joi.array().items(Joi.string().uri()).required(),

  pastProjects: Joi.array()
    .items(
      Joi.object({
        beforeImage: Joi.string().uri().required(),
        afterImage: Joi.string().uri().required(),
      })
    )
    .required(),

  testimonials: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().required(),
        text: Joi.string().required(),
        video: Joi.string().uri().required(),
      })
    )
    .required(),

  awards: Joi.array().items(Joi.string().uri()).required(),
});

// Step 4: FAQ
const stepFaq = Joi.object({
  ...baseStepFields,
  questions: Joi.array()
    .items(
      Joi.object({
        heading: Joi.string().required(),
        description: Joi.string().required(),
        video: Joi.string().uri().optional(),
      })
    )
    .required(),
});

// Step 6: Location Advantage
const stepLocationAdvantage = Joi.object({
  ...baseStepFields,
  mapUrl: Joi.string().uri().required(),
  video: Joi.string().uri().required(),
});

// Validate all steps by type
const stepSchema = Joi.object({
  stepType: Joi.string()
    .valid(
      "whyEstate",
      "virtualInspection",
      "trustCredibility",
      "faq",
      "featuresAmenities",
      "locationAdvantage"
    )
    .required(),
  data: Joi.alternatives()
    .conditional("stepType", {
      switch: [
        { is: "whyEstate", then: stepWhyEstate },
        { is: "virtualInspection", then: stepVirtualInspection },
        { is: "trustCredibility", then: stepTrustCredibility },
        { is: "faq", then: stepFaq },
        { is: "featuresAmenities", then: stepFeaturesAmenities },
        { is: "locationAdvantage", then: stepLocationAdvantage },
      ],
      otherwise: Joi.forbidden(),
    })
    .required(),
});

// Estate schema
const validateEstate = Joi.object({
  estateName: Joi.string().required(),
  steps: Joi.array().items(stepSchema).min(6).required(),
});

module.exports = validateEstate;

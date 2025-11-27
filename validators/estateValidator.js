const Joi = require("joi");

// Base fields for all steps
const baseStepFields = {
  heading: Joi.string().required(),
  description: Joi.string().required(),

  // Optional video: string URI or array of URIs
  video: Joi.alternatives()
    .try(Joi.string().uri(), Joi.array().items(Joi.string().uri()))
    .optional(),
};

// Step-specific schemas
const stepWhyEstate = Joi.object({
  ...baseStepFields,
});

const stepFeaturesAmenities = Joi.object({
  ...baseStepFields,
});

const stepVirtualInspection = Joi.object({
  ...baseStepFields,
  mapUrl: Joi.string().uri().required(),
});

const stepTrustCredibility = Joi.object({
  ...baseStepFields, // video is optional here
  certificates: Joi.array().items(Joi.string().uri()).min(1).required(),
  pastProjects: Joi.array()
    .items(
      Joi.object({
        beforeImage: Joi.string().uri().required(),
        afterImage: Joi.string().uri().required(),
      })
    )
    .min(1)
    .required(),
  testimonials: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().required(),
        text: Joi.string().required(),
        video: Joi.array().items(Joi.string().uri()).min(1).required(),
      })
    )
    .min(1)
    .required(),
  awards: Joi.array().items(Joi.string().uri()).min(1).required(),
});

const stepFaq = Joi.object({
  ...baseStepFields, // video optional at step-level if needed
  questions: Joi.array()
    .items(
      Joi.object({
        heading: Joi.string().required(),
        description: Joi.string().required(),
        video: Joi.alternatives()
          .try(Joi.string().uri(), Joi.array().items(Joi.string().uri()))
          .optional(),
      })
    )
    .min(1)
    .required(),
});

const stepLocationAdvantage = Joi.object({
  ...baseStepFields,
  video: Joi.alternatives()
    .try(Joi.string().uri(), Joi.array().items(Joi.string().uri()).min(1))
    .optional(),
  mapUrl: Joi.string().uri().required(),
});

// Step wrapper
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

// Full estate schema
const validateEstate = Joi.object({
  estateName: Joi.string().required(),
  steps: Joi.array().items(stepSchema).min(6).required(),
});

// Fetch Estate schema
const validateFetchEstate = Joi.object({
  estateName: Joi.string().required(),
});

module.exports = { validateEstate, validateFetchEstate };

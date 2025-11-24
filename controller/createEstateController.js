const AppError = require("../utils/AppError");
const { estateModel } = require("../model/estateModel");
const validateEstate = require("../validators/estateValidator");

const STEP_ORDER = {
  whyEstate: 1,
  virtualInspection: 2,
  trustCredibility: 3,
  faq: 4,
  featuresAmenities: 5,
  locationAdvantage: 6,
};

// CREATE ESTATE
const createEstate = async (req, res, next) => {
  try {
    // 1️⃣ JOI VALIDATION
    const { error } = validateEstate.validate(req.body, { abortEarly: false });

    if (error) {
      return next(
        new AppError(
          "Validation failed",
          400,
          error.details.map((d) => d.message)
        )
      );
    }

    const { estateName, steps } = req.body;

    // 2️⃣ PREVENT DUPLICATE ESTATES
    const existing = await estateModel.findOne({ estateName });
    if (existing) {
      return next(new AppError(`Estate '${estateName}' already exists`, 400));
    }

    // 3️⃣ PREVENT DUPLICATE stepTypes
    const stepTypes = steps.map((s) => s.stepType);
    const duplicates = stepTypes.filter(
      (item, index) => stepTypes.indexOf(item) !== index
    );

    if (duplicates.length > 0) {
      return next(
        new AppError(
          `Duplicate step types found: ${duplicates.join(", ")}`,
          400
        )
      );
    }

    // 4️⃣ AUTO-ASSIGN stepNumbers BASED ON stepType
    const formattedSteps = steps.map((step) => ({
      ...step,
      stepNumber: STEP_ORDER[step.stepType],
    }));

    // 5️⃣ SORT STEPS BY stepNumber (1 → 6)
    formattedSteps.sort((a, b) => a.stepNumber - b.stepNumber);

    // 6️⃣ SAVE TO DATABASE
    const newEstate = await estateModel.create({
      estateName,
      steps: formattedSteps,
    });

    return res.status(201).json({
      status: "success",
      message: "Estate created successfully",
      estate: newEstate,
    });
  } catch (err) {
    next(err);
  }
};

// GET ONE ESTATE
const getEstate = async (req, res, next) => {
  try {
    const estate = await estateModel.findById(req.params.id);

    if (!estate) {
      return next(new AppError("Estate not found", 404));
    }

    res.status(200).json({
      status: "success",
      estate,
    });
  } catch (err) {
    next(err);
  }
};

// GET ALL ESTATES
const getAllEstates = async (req, res, next) => {
  try {
    const estates = await estateModel.find().sort({ createdAt: -1 });
    res.status(200).json({
      status: "success",
      count: estates.length,
      estates,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { createEstate, getEstate, getAllEstates };

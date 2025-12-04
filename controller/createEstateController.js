const AppError = require("../utils/AppError");
const { estateModel } = require("../model/estateModel");
const { validateEstate } = require("../validators/estateValidator");

const STEP_ORDER = {
  whyEstate: 1,
  locationAdvantage: 2,
  featuresAmenities: 3,
  virtualInspection: 4,
  faq: 5,
  trustCredibility: 6,
};

// CREATE ESTATE
const createEstate = async (req, res, next) => {
  try {
    // 1️⃣ Validate input
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

    // 2️⃣ Prevent duplicate estate name
    const existing = await estateModel.findOne({ estateName });
    if (existing) {
      return next(new AppError(`Estate '${estateName}' already exists`, 400));
    }

    // 3️⃣ Prevent duplicate stepTypes
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

    // 4️⃣ Auto-assign stepNumber & normalize arrays
    const formattedSteps = steps.map((step) => {
      // Step-level video → always array
      const stepVideo = Array.isArray(step.data.video)
        ? step.data.video
        : step.data.video
        ? [step.data.video]
        : [];

      // FAQ questions → ensure videos are arrays
      const formattedQuestions =
        step.data.questions?.map((q) => ({
          ...q,
          video: Array.isArray(q.video) ? q.video : q.video ? [q.video] : [],
        })) || [];

      return {
        stepType: step.stepType,
        stepNumber: STEP_ORDER[step.stepType],

        data: {
          ...step.data,
          video: stepVideo,
          certificates: step.data.certificates || [],
          pastProjects: step.data.pastProjects || [],
          testimonials: step.data.testimonials || [],
          awards: step.data.awards || [],
          questions: formattedQuestions,
        },
      };
    });

    // 5️⃣ Sort steps by stepNumber
    formattedSteps.sort((a, b) => a.stepNumber - b.stepNumber);

    // 6️⃣ Save to DB
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
    const { estateId } = req.params; // Or req.query / req.params

    if (!estateId) {
      return next(new AppError("EstateId is required", 400));
    }

    const estate = await estateModel.findById(estateId);

    if (!estate) {
      return next(new AppError("Estate not found", 404));
    }

    res.status(200).json({
      message: "Fetched estate successfully",
      data: {
        estateId: estate._id,
        estate,
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET ALL ESTATES
const getAllEstates = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, sort = "-createdAt" } = req.query;

    const numericLimit = Math.max(Number(limit) || 10, 1);
    const numericPage = Math.max(Number(page) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;

    const [estates, totalDocuments] = await Promise.all([
      estateModel.find().sort(sort).skip(skip).limit(numericLimit).lean(),
      estateModel.countDocuments(),
    ]);

    const totalPages = Math.ceil(totalDocuments / numericLimit);

    res.status(200).json({
      status: "success",
      message: estates.length > 0 ? "All estates" : "No estates found",
      count: totalDocuments,
      pagination: {
        currentPage: numericPage,
        totalPages,
        limit: numericLimit,
        totalResults: totalDocuments,
        hasNextPage: numericPage < totalPages,
        hasPrevPage: numericPage > 1,
      },
      data: estates,
    });
  } catch (err) {
    next(err);
  }
};

// GET ALL ESTATES
const getAllEstatesUser = async (req, res, next) => {
  try {
    const estates = await estateModel.find();

    console.log(estates.length);

    res.status(200).json({
      status: "success",
      message: estates.length > 0 ? "All estates" : "No estates found",
      count: estates.length,
      data: estates,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { createEstate, getEstate, getAllEstates, getAllEstatesUser };

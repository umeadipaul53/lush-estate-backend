const questionaireModel = require("../model/questionaireModel");
const AppError = require("../utils/AppError");
const { estateModel } = require("../model/estateModel");

const fetchAllQuestionsCount = async (req, res, next) => {
  try {
    // 🔍 Get all estates
    const estates = await estateModel.find({}, "_id estateName");
    if (!estates || estates.length === 0) {
      return next(new AppError("No estates found", 404));
    }

    // 📝 Count questions per estate
    const questionCounts = await questionaireModel.aggregate([
      {
        $group: {
          _id: "$estateId",
          totalQuestions: { $sum: 1 },
        },
      },
    ]);

    // 🔗 Map counts for quick lookup
    const countsMap = {};
    questionCounts.forEach((q) => {
      countsMap[q._id.toString()] = q.totalQuestions;
    });

    // Prepare final data
    const data = estates.map((estate) => ({
      estateId: estate._id,
      estateName: estate.estateName,
      totalQuestions: countsMap[estate._id.toString()] || 0,
    }));

    res.status(200).json({
      status: "success",
      message: "Question counts for all estates fetched successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = fetchAllQuestionsCount;

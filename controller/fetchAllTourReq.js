const tourRequestModel = require("../model/tourModel");
const AppError = require("../utils/AppError");

const fetchAllTourReq = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10, sort = "-createdAt" } = req.query;

    const numericLimit = Math.max(Number(limit) || 10, 1);
    const numericPage = Math.max(Number(page) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;

    // ✅ Only filter by status if provided
    const filter = status ? { status } : {};

    // ✅ Use numericLimit instead of limit
    const [tours, totalDocuments] = await Promise.all([
      tourRequestModel.find(filter).sort(sort).skip(skip).limit(numericLimit),
      tourRequestModel.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalDocuments / numericLimit);

    res.status(200).json({
      status: "success",
      message:
        tours.length > 0 ? "All tour requests" : "No tour requests found",
      count: totalDocuments,
      pagination: {
        currentPage: numericPage,
        totalPages,
        limit: numericLimit,
        totalResults: totalDocuments,
        hasNextPage: numericPage < totalPages,
        hasPrevPage: numericPage > 1,
      },
      data: tours,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = fetchAllTourReq;

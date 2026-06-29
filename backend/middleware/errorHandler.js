const { ZodError } = require("zod");

function formatZodIssues(error) {
  const issues = error.errors ?? error.issues ?? [];

  return issues.map((issue) => ({
    path: issue.path?.length ? issue.path.join(".") : "body",
    message: issue.message,
    code: issue.code,
  }));
}

function notFoundHandler(req, res) {
  res.status(404).json({
    error: {
      message: "Endpoint not found",
    },
  });
}

function errorHandler(error, req, res, next) {
  if (error instanceof ZodError) {
    return res.status(400).json({
      error: {
        message: "Validation error",
        errors: formatZodIssues(error),
      },
    });
  }

  const statusCode = error.statusCode ?? 500;

  if (statusCode >= 500) {
    console.error(error);
  }

  return res.status(statusCode).json({
    error: {
      message: error.message ?? "Internal server error",
      details: error.details,
    },
  });
}

module.exports = {
  errorHandler,
  notFoundHandler,
};

function validate(schema, source = "body") {
  return (req, res, next) => {
    const target = req[source];
    const result = schema.safeParse(target);

    if (!result.success) {
      return res.status(400).json({
        error: "validation error",
        details: result.error.issues,
      });
    }

    req[source] = result.data;
    return next();
  };
}

module.exports = validate;

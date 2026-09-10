function validate(schema, source = 'body') {
    return (req, res, next) => {
        const result = schema.safeParse(req[source]);
        if (!result.success) {
            return res.status(422).json({
                error: {
                    message: 'Validation failed',
                    details: result.error.flatten().fieldErrors,
                },
            });
        }
        req.body = result.data;
        next();
    };
}

module.exports = validate;
// musí mať 4 parametre — inak Express nerozpozná middleware ako error handler
function errorHandler(err, req, res, next) {
    console.error(err);
    return res.status(500).json({
        error: 'internalServerError',
        message: 'An unexpected error occurred.'
    });
}

module.exports = errorHandler;

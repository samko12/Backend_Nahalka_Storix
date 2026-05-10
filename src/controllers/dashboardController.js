const dashboardDao = require('../dao/dashboardDao');

async function getSummary(req, res, next) {
    try {
        const summary = dashboardDao.getSummary();
        return res.status(200).json(summary);
    } catch (err) {
        next(err);
    }
}

module.exports = { getSummary };

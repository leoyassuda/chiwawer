// /[url].js
module.exports = (req, res) => {
    res.send(`This response will send details about the ${req.query.url}.`)
}
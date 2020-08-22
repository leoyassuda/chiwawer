module.exports = (req, res) => {
    const {
        name
    } = req.body
    res.send(
        `This response would create a new team called ${name}, using a POST request.`
    )
}
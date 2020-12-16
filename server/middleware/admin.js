let admin = (req, res, next) => {
    if(req.user.role === 0) {
        return res.send('No eres administrador')
    }
    next()
    }

module.exports = { admin }
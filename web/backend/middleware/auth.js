var authenticate = (req, res, next) => {
    if (req.session.views > 0) {
        req.session.views++;
        next();
    } else {
        res.status(401).send({message: '401 ERROR: Access Denied'});
    }    
};

module.exports = authenticate;
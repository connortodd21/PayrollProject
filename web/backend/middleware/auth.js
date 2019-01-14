var authenticate = (req, res, next) => {
    if (req.session.key && req.cookies) {
        next();
    } else {
        res.status(401).send({message: '401 ERROR: Access Denied'});
    }    
};

module.exports = authenticate;
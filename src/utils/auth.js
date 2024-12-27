export const protectAuth = (req, res, next) => {
    const bearer = req.headers.authorization;
    if (!bearer){
        res.status(401).json({message: 'Please provide a api token before making your request'});
    }else{
        next();
    }
    
}
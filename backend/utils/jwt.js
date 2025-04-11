import jwt from 'jsonwebtoken';



export const createJWT = ({payload}) => {
    if (!process.env.JWT_SECRET || !process.env.JWT_LIFETIME) {
        throw new Error('Environment variables JWT_SECRET and JWT_LIFETIME must be defined');
    }
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_LIFETIME
    });
    return token;
}


 export const isTokenValid = ({token}) => jwt.verify(token, process.env.JWT_SECRET);

 export const attachCookiesToResponse =  ({res, user}) => {
    const token = createJWT({payload: user})
    const oneDay = 1000 * 60 * 60 * 24;
    const isProd = process.env.NODE_ENV === 'production';

    // Set cookie with proper settings for cross-domain
    res.cookie('token', token, {
        httpOnly: true,
        expires: new Date(Date.now() + oneDay),
        secure: isProd,
        signed: true,
        sameSite: isProd ? 'none' : 'lax', // This is crucial for cross-domain cookies
    })

}
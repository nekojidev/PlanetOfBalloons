import dotenv from 'dotenv';
import 'express-async-errors'
dotenv.config();

//express
import express from 'express';
const app = express();

//rest of packages
import { connectDB } from './config/db.js';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import fileUpload from 'express-fileupload';
import rateLimiter from 'express-rate-limit';
import helmet from 'helmet';
import cors from 'cors';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';


//routes

import authRoutes from './routes/authRoutes.js'
import userRoutes from './routes/userRoutes.js'
import productRoutes from './routes/productRoutes.js'
import orderRoutes from './routes/orderRoutes.js'
import categoryRoutes from './routes/categoryRoutes.js'
import announcementsRoutes from './routes/announcementRoutes.js'
import promotionsRoutes from './routes/promotionRoutes.js'

//middleware
import notFoundMiddleware from './middleware/notFoundMiddleware.js';
import errorHandlerMiddleware from './middleware/errorHandlerMiddleware.js';

// app.set('trust proxy', 1);
app.use(
    rateLimiter({
        windowMs: 15* 60 * 1000,
        max: 100,
    })
)
app.use(helmet())
app.use(cors())
app.use(xss())
app.use(mongoSanitize())
app.use(morgan('dev'))


app.use(express.json())
app.use(cookieParser(process.env.JWT_SECRET))

app.use(fileUpload())


app.use('/api/v1/auth', authRoutes )
app.use('/api/v1/users', userRoutes )
app.use('/api/v1/products', productRoutes )
app.use('/api/v1/orders', orderRoutes )
app.use('/api/v1/categories', categoryRoutes )
app.use('/api/v1/announcements', announcementsRoutes)
app.use('/api/v1/promotions', promotionsRoutes)


app.use(notFoundMiddleware)
app.use(errorHandlerMiddleware)

const PORT =  process.env.PORT || 3000 



const start = async () => {

    try {
        await connectDB(process.env.MONGO_URI)
        app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT} `);

        })
       } catch (err) {
        console.log(err);
        
       }


}

start()
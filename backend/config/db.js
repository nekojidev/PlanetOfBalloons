import mongoose from "mongoose";


export const connectDB = async (url) => {
    mongoose.connect(url)
}



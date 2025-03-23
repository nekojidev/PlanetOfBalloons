import mongoose from "mongoose"
import bcrypt from "bcryptjs"
const validator = require('validator');

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please Provide your name'],
            minLength: 2,
            maxLength: 50,
         },
         email: {
            type: String, 
            required: [true, 'Please provide your email'],
            unique: true,
            validate: {
                validator: validator.isEmail,
                message: 'Please provide a valid email'
            }
         },
         password: {
            type: String,
            required: [true, 'Please provide a password'],
            minLength: 6,
         },
         role: {
            type: String,
            enum: ['admin', 'user'],
            default: 'user'
         }
    },{
        timestamps: true
    }
)


// pre save 

userSchema.pre('save', async function(next) {
    this.password = await bcrypt.hash(this.password, 10)
    next()
})

//match password

userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password)
}


export default mongoose.model('User', userSchema)

import mongoose from "mongoose"
import bcrypt from "bcryptjs"
import validator from "validator"

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
            phone: {
                type: String,
                required: [true, 'Please provide your phone number'],
                unique: true,
                validate: {
                    validator: validator.isMobilePhone,
                    message: 'Please provide a valid phone number'
                }
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
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 10)
    next()
})

//match password

userSchema.methods.comparePassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password)
}


export default mongoose.model('User', userSchema)

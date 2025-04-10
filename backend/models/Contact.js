import mongoose from "mongoose";

const contactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your name'],
      minLength: 2,
      maxLength: 50,
    },
    email: {
      type: String,
      required: [true, 'Please provide your email'],
    },
    phone: {
      type: String,
      required: [true, 'Please provide your phone number'],
    },
    message: {
      type: String,
      required: [true, 'Please provide a message'],
      minLength: 10,
    },
    status: {
      type: String,
      enum: ['new', 'read', 'replied'],
      default: 'new',
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model("Contact", contactSchema);
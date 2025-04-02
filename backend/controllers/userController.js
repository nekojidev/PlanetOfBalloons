import User from "../models/User.js";
import { StatusCodes } from "http-status-codes";
import CustomAPIError from "../errors/index.js";

import { createTokenUser } from "../utils/createTokenUser.js";
import { checkPermissions } from "../utils/checkPermissions.js";
import { attachCookiesToResponse } from "../utils/jwt.js";

export const getUsers = async (req, res) => {
  try {
    const users = await User.find({ role: "user" }).select("-password");
    res.status(StatusCodes.OK).json({ users });
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message || "Server Error" });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      throw new CustomAPIError.BadRequestError("Invalid user ID");
    }
    const user = await User.findById(id).select("-password");
    if (!user) {
      throw new CustomAPIError.NotFoundError(`No user with ID: ${id}`);
    }
    checkPermissions(req.user, user._id);

    res.status(StatusCodes.OK).json({ user });
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message || "Server Error" });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    if (!name || !email || !phone) {
      throw new CustomAPIError.BadRequestError("Please provide all values");
    }
    const user = await User.findOne({ _id: req.user.userId });
    const isEmailExits = await User.findOne({ email });
    const isPhoneExits = await User.findOne({ phone });
    if (isEmailExits && isEmailExits._id.toString() !== user._id.toString()) {
      throw new CustomAPIError.BadRequestError("Email already exists");
    }
    if (isPhoneExits && isPhoneExits._id.toString() !== user._id.toString()) {
      throw new CustomAPIError.BadRequestError("Phone number already exists");
    }

    user.email = email;
    user.phone = phone;
    user.name = name;

    await user.save();

    const tokenUser = createTokenUser(user);
    attachCookiesToResponse({ res, user: tokenUser });
    res.status(StatusCodes.OK).json({ user: tokenUser });
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message || "Server Error" });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      throw new CustomAPIError.BadRequestError("Invalid user ID");
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new CustomAPIError.NotFoundError(`No user with ID: ${userId}`);
    }
    checkPermissions(req.user, user._id);
    await user.deleteOne();
    res.status(StatusCodes.OK).json({ msg: "Success! User removed" });
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message || "Server Error" });
  }
};

export const updateUserPassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      throw new CustomAPIError.BadRequestError("Please provide all values");
    }

    const user = await User.findOne({ _id: req.user.userId });

    const isPasswordCorrect = await user.comparePassword(oldPassword);
    if (!isPasswordCorrect) {
      throw new CustomAPIError.UnauthenticatedError("Invalid credentials");
    }
    user.password = newPassword;
    await user.save();
    res.status(StatusCodes.OK).json({ msg: "Success! Password updated" });
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message || "Server Error" });
  }
};
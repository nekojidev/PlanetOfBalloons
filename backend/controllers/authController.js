import User from '../models/User.js';
import { StatusCodes } from 'http-status-codes';
import CustomError from '../errors/index.js';

import { attachCookiesToResponse } from '../utils/jwt.js';
import { createTokenUser } from '../utils/createTokenUser.js';

export const registerUser = async (req, res) => {
  try {
    const { email, name, password, phone } = req.body;

    const emailAlreadyExists = await User.findOne({ email });
    if (emailAlreadyExists) {
      throw new CustomError.BadRequestError('Email Already Exists');
    }

    const phoneAlreadyExists = await User.findOne({ phone });
    if (phoneAlreadyExists) {
      throw new CustomError.BadRequestError('Phone Already Exists');
    }

    if (!email || !name || !password || !phone) {
      throw new CustomError.BadRequestError('Please provide all values');
    }

    const isFirstAccount = (await User.countDocuments({})) === 0;
    const role = isFirstAccount ? 'admin' : 'user';

    const user = await User.create({ email, name, password, phone, role });
    const tokenUser = createTokenUser(user);
    attachCookiesToResponse({ res, user: tokenUser });
    res.status(StatusCodes.CREATED).json({ user: tokenUser });
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message || 'Server Error' });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new CustomError.BadRequestError('Please provide email and password');
    }

    const user = await User.findOne({ email });
    if (!user) {
      throw new CustomError.UnauthenticatedError('Invalid Credentials');
    }

    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      throw new CustomError.UnauthenticatedError('Invalid Credentials');
    }

    const tokenUser = createTokenUser(user);
    attachCookiesToResponse({ res, user: tokenUser });
    res.status(StatusCodes.OK).json({ user: tokenUser });
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message || 'Server Error' });
  }
};

export const getMe = async (req, res) => {
  try {
    res.status(StatusCodes.OK).json({ user: req.user });
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message || 'Server Error' });
  }
};

export const logoutUser = async (req, res) => {
  try {
    res.cookie('token', 'none', {
      httpOnly: true,
      expires: new Date(Date.now() + 1000),
    });
    res.status(StatusCodes.OK).json({ message: 'User logged out' });
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message || 'Server Error' });
  }
};
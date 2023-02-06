import express from 'express';
import dotenv from 'dotenv';
dotenv.config({ path: 'config/.env' });
import jwt from 'jsonwebtoken';
import axios from 'axios';
import Book from './book.model.js';

const secret = process.env.secretKey;
const app = express();

export const authenticate = async (req, res, next) => {
  try {
    const authorization = req.headers['authorization'].split(' ');
    if (authorization[0] !== 'Bearer') {
      return res
        .status(401)
        .send({ status: false, message: 'invalid validation method' });
    }
    const token = jwt.verify(authorization[1], secret);
    const userId = token._id;
    const response = await axios.get(`http://localhost:7000/${userId}`);
    if (!response.data) {
      return res.status(401).send({
        status: false,
        message: 'you are not a authenticted person',
      });
    }
    req.userId = userId;
    return next();
  } catch (err) {
    return res.status(403).send({ status: false, message: err.message });
  }
};

export const authorize = async (req, res, next) => {
  try {
    const authorization = req.headers['authorization'].split(' ');
    if (authorization[0] !== 'Bearer') {
      return res
        .status(401)
        .send({ status: false, message: 'invalid validation method' });
    }
    const token = jwt.verify(authorization[1], secret);
    const userId = token._id;
    const response = await axios.get(`http://localhost:7000/${userId}`);
    if (!response.data) {
      return res.status(401).send({
        status: false,
        message: 'you are not a authorized person',
      });
    }
    const bookId = req.params.id;
    const bookResponse = await Book.findById(bookId);
    if (!bookResponse) {
      return res
        .status(404)
        .send({ status: false, message: 'book not found or deleted' });
    }
    if (userId !== bookResponse.userId.toString()) {
      return res.status(401).send({
        status: false,
        message: 'you are not a authorized person',
      });
    }

    return next();
  } catch (err) {
    return res.status(403).send({ status: false, message: err.message });
  }
};

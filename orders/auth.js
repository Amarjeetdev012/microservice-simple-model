import express from 'express';
import dotenv from 'dotenv';
dotenv.config({ path: 'config/.env' });
import jwt from 'jsonwebtoken';
import axios from 'axios';

const secret = process.env.secretKey;
const app = express();

export const authenticate = async (req, res, next) => {
  try {
    const authorization = req.headers.authorization.split(' ');
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
    const userResponse = await axios.get(`http://localhost:7000/${userId}`);
    if (!userResponse.data) {
      return res.status(401).send({
        status: false,
        message: 'you are not a authorized person',
      });
    }
    const customeId = req.body.customerID;
    const customerResponse = await axios.get(
      `http://localhost:5000/customer/${customeId}`
    );
    if (userId !== customerResponse.data.data.userId) {
      return res
        .status(401)
        .send({ status: false, message: 'you are not authorised user' });
    }
    const bookId = req.body.bookID;
    const bookResponse = await axios.get(
      `http://localhost:4000/book/${bookId}`
    );
    console.log(
      'bookResponseResponse.data.data.userId',
      bookResponse.data.data.userId
    );
    if (userId !== bookResponse.data.data.userId) {
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

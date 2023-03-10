import mongoose from 'mongoose';
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config({ path: 'config/.env' });
import express from 'express';
import Order from './order.model.js';
import { connectDatabase } from './database/mongoose.model.js';
// Connect
connectDatabase(process.env.MONGO_ORDER);

import logger from 'morgan';
import { authenticate, authorize } from './auth.js';

const app = express();
const port = 6000;
app.use(express.json());
app.use(logger('dev'));

// Validator function for objectid
const ObjectId = mongoose.Types.ObjectId;
function isValidObjectId(id) {
  if (ObjectId.isValid(id)) {
    if (String(new ObjectId(id)) === id) return true;
    return false;
  }
  return false;
}

// create order
app.post('/order', authorize, async (req, res) => {
  try {
    const data = req.body;
    const { customerID, bookID, initialDate } = data;
    if (!customerID || !bookID || !initialDate) {
      return res.status(400).send({
        status: false,
        message:
          'something missing please check you have put all details customerID,bookID,initialDate',
      });
    }
    if (!isValidObjectId(customerID)) {
      return res.status(400).send({
        status: false,
        message: 'please provide a valid customerID id',
      });
    }
    if (!isValidObjectId(bookID)) {
      return res
        .status(400)
        .send({ status: false, message: 'please provide a valid bookID id' });
    }
    const result = await Order.create(data);
    return res.status(201).send({
      status: true,
      message: 'New order added successfully!',
      data: result,
    });
  } catch (error) {
    return res.status(500).send({ status: false, msg: error.message });
  }
});

// get orders
app.get('/orders', authenticate, async (req, res) => {
  try {
    const data = await Order.find();
    if (data) {
      res.status(200).send({
        status: true,
        message: 'orders find succesfully',
        data: data,
      });
    } else {
      res.status(404).send({ status: false, message: 'Orders not found' });
    }
  } catch (error) {
    return res.status(500).send({ status: false, msg: error.message });
  }
});

// get order by id
app.get('/order/:id', authenticate, async (req, res) => {
  try {
    const id = req.params.id;
    if (!isValidObjectId(id)) {
      return res
        .status(400)
        .send({ status: false, message: 'please provide a valid order id' });
    }
    const findOrder = await Order.findById(id);
    const customerId = findOrder.customerID.toString();
    const bookId = findOrder.bookID.toString();
    const customerResponse = await axios.get(
      `http://localhost:5000/customer/${customerId}`
    );
    let orderObject = {
      CustomerName: customerResponse.data.data.name,
      BookTitle: '',
    };
    const bookResponse = await axios.get(
      `http://localhost:4000/book/${bookId}`
    );
    orderObject.BookTitle = bookResponse.data.data.title;
    res.status(200).send({
      status: true,
      message: 'order get successfully',
      data: orderObject,
    });
  } catch (error) {
    return res.status(500).send({ status: false, msg: error.message });
  }
});

// listening port
app.listen(port, () => {
  console.log(`server is Running on port ${port} - This is Order service`);
});

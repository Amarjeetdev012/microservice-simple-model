import dotenv from 'dotenv';
dotenv.config({ path: 'config/.env' });
import express from 'express';
import mongoose from 'mongoose';
import Customer from './customer.model.js';
import { connectDatabase } from './database/mongoose.database.js';
import logger from 'morgan';
import { authenticate, authorize } from './auth.js';

// Connect
connectDatabase(process.env.MONGO_CUSTOMER);

const app = express();
app.use(logger('dev'));

const port = 5000;
app.use(express.json());

// Validator function for objectid
const ObjectId = mongoose.Types.ObjectId;
function isValidObjectId(id) {
  if (ObjectId.isValid(id)) {
    if (String(new ObjectId(id)) === id) return true;
    return false;
  }
  return false;
}

// create customer
app.post('/customer', authenticate, async (req, res) => {
  try {
    const data = req.body;
    const { name, age, address } = data;
    const userId = req.userId;
    if (!name || !age || !address || !userId) {
      return res.status(400).send({
        status: false,
        message: 'please provide required fields name age address',
      });
    }
    const createData = {};
    createData.name = name;
    createData.age = age;
    createData.userId = userId;
    createData.address = address;
    const result = await Customer.create(createData);
    res.status(201).send({
      status: true,
      message: 'New Customer created successfully!',
      data: result,
    });
  } catch (error) {
    return res.status(500).send({ status: false, msg: error.message });
  }
});

// get customers
app.get('/customers', authenticate, async (req, res) => {
  try {
    console.log('=======............>>>>>>>>>>>');
    const data = await Customer.find();
    if (data) {
      res.status(200).send({
        status: true,
        message: 'customer find sucessfully',
        data: data,
      });
    } else {
      res.status(404).send({ status: false, message: 'customers not found' });
    }
  } catch (error) {
    return res.status(500).send({ status: false, msg: error.message });
  }
});

// get custome by id
app.get('/customer/:id', async (req, res) => {
  try {
    const id = req.params.id;
    if (!isValidObjectId(id)) {
      return res
        .status(400)
        .send({ status: false, message: 'please provide a valid object id' });
    }
    const data = await Customer.findById(id);
    if (data) {
      res.status(200).send({
        status: true,
        message: 'customer find succesfully',
        data: data,
      });
    } else {
      res.status(404).send({ status: false, message: 'customer not found' });
    }
  } catch (error) {
    return res.status(500).send({ status: false, msg: error.message });
  }
});

// delete by id
app.delete('/customer/:id', authorize, async (req, res) => {
  try {
    const id = req.params.id;
    if (!isValidObjectId(id)) {
      return res
        .status(400)
        .send({ status: false, message: 'please provide a valid object id' });
    }
    const data = await Customer.findByIdAndRemove(id);
    if (data) {
      res
        .status(204)
        .send({ status: true, message: 'customer deleted Successfully!' });
    } else {
      res.status(404).send({ status: false, message: 'Customer Not Found!' });
    }
  } catch (error) {
    return res.status(500).send({ status: false, msg: error.message });
  }
});

// listening port
app.listen(port, () => {
  console.log(`server is Running on port ${port}- This is Customer service`);
});

import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import Book from './book.model.js';
import { connectDatabase } from './database/mongoose.databse.js';
import logger from 'morgan';
import mongoose from 'mongoose';

// Connect database
connectDatabase(process.env.MONGO_BOOK);
const app = express();
app.use(logger('dev'));
const port = 4000;
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
// create a book
app.post('/book', async (req, res) => {
  try {
    const data = req.body;
    let token = req.cookies;
    const { title, author } = data;
    if (!title) {
      return res
        .status(400)
        .send({ status: false, message: 'title is required' });
    }
    if (!author) {
      return res
        .status(400)
        .send({ status: false, message: 'author is required' });
    }
    const result = await Book.create(data);
    res.status(201).send({
      status: true,
      message: 'New Book added successfully!',
      data: result,
    });
  } catch (error) {
    return res.status(500).send({ status: false, msg: error.message });
  }
});

// get books
app.get('/books', async (req, res) => {
  try {
    const cookie = req.rawHeaders[15];
    const token = cookie.split('=').splice(1, 2).toString();
    const data = await Book.find();
    if (data.length !== 0) {
      res.status(200).send({
        status: true,
        message: 'Book found successfully!',
        data: data,
      });
    } else {
      res.status(404).send({ status: false, message: 'Books not found' });
    }
  } catch (error) {
    return res.status(500).send({ status: false, msg: error.message });
  }
});

// get book by id
app.get('/book/:id', async (req, res) => {
  try {
    const id = req.params.id;
    if (!isValidObjectId(id)) {
      return res
        .status(400)
        .send({ status: false, message: 'please provide a valid object id' });
    }
    const data = await Book.findById(id);
    if (data) {
      res
        .status(200)
        .send({ status: true, message: 'book find sucessfully', data: data });
    } else {
      res.status(404).send({ status: false, message: 'Books not found' });
    }
  } catch (error) {
    return res.status(500).send({ status: false, msg: error.message });
  }
});

// delete book by id
app.delete('/book/:id', async (req, res) => {
  try {
    const data = await Book.findByIdAndDelete(req.params.id);
    if (data) {
      res
        .status(204)
        .send({ status: true, message: 'Book deleted Successfully!' });
    } else {
      res.status(404).send({ status: false, message: 'Book Not found!' });
    }
  } catch (error) {
    return res.status(500).send({ status: false, msg: error.message });
  }
});

// listening port
app.listen(port, () => {
  console.log(`server is Running on port ${port} - This is Book service`);
});

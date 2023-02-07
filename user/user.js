import express from 'express';
import User from './user.model.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import logger from 'morgan';
import { connectDatabase } from './database/mongoose.database.js';
// import bcrypt from 'bcrypt';
dotenv.config({ path: 'config/.env' });

const app = express();
app.use(logger('dev'));
app.use(express.json());
connectDatabase(process.env.MONGO_USER);

const port = 7000;
const secretKey = process.env.secretKey;

app.post('/register', async (req, res) => {
  try {
    const data = req.body;
    const { name, email, password } = data;
    if (!name || !email || !password) {
      return res.status(400).send({
        status: false,
        message: 'please provide required fileds name,email,password',
      });
    }
    const findUser = await User.findOne({ email: email });
    if (findUser) {
      return res.status(404).send({
        status: false,
        message: 'this email is already used try new emailid',
      });
    }
    const hashPassword = await bcrypt.hash(password, 10);
    const sendData = {};
    sendData.name = name;
    sendData.email = email;
    sendData.password = hashPassword;
    await User.create(sendData);
    delete sendData.password;
    res.status(201).send({
      status: true,
      message: 'user created succesfully',
      data: sendData,
    });
  } catch (error) {
    return res.status(500).send({ status: false, msg: error.message });
  }
});

app.post('/login', async (req, res) => {
  try {
    const data = req.body;
    const { email, password } = data;
    if (!email || !password) {
      return res.status(400).send({
        status: false,
        message: 'please provide vaild fileds email, password',
      });
    }
    const findUser = await User.findOne({ email: email });
    if (!findUser) {
      return res.status(404).send({ status: false, message: 'user not found' });
    }
    const userId = findUser._id.toString();
    const token = jwt.sign({ _id: userId }, secretKey);
    const sendData = {};
    sendData.email = email;
    sendData.token = token;
    res.cookie('token', token);
    return res
      .status(200)
      .send({ status: true, message: 'login succesfully', data: sendData });
  } catch (error) {
    return res.status(500).send({ status: false, msg: error.message });
  }
});

app.get('/:userid', async (req, res) => {
  try {
    const id = req.params.userid;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).send({ status: false, message: 'user not found' });
    } else {
      res.status(200).send({ status: true, message: 'user found', data: user });
    }
  } catch (error) {
    return res.status(500).send({ status: false, msg: error.message });
  }
});

// listening port
app.listen(port, () => {
  console.log(`server is Running on port ${port} - This is User service`);
});

import mongoose from 'mongoose';
const CustomerSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
      required: true,
    },
    userId:{
      type:mongoose.Types.ObjectId
    },
    address: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);
const Customer = mongoose.model('customer', CustomerSchema);

export default Customer;

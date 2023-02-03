import mongoose from 'mongoose';
const bookSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    author: {
      type: String,
      required: true,
    },
    numberPages: {
      type: Number,
    },
    publisher: {
      type: String,
    },
  },
  { timestamps: true }
);

const Book = mongoose.model('book', bookSchema);

export default Book;

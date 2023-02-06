import mongoose, { mongo } from 'mongoose';
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
    userId: {
      type: mongoose.Types.ObjectId,
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

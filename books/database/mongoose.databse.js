import mongoose from 'mongoose';
mongoose.set('strictQuery', true);
export const connectDatabase = (url) => {
  console.log('mongodb is connecting');
  mongoose
    .connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log(`mongodb is connected`);
    })
    .catch((err) => {
      console.log(`${err}`);
    });
};

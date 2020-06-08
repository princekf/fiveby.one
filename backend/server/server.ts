import * as mongoose from 'mongoose';
import app from './app';


const url = process.env.MONGODB_URI || 'mongodb://localhost:27017/';
const DEFAULT_PORT = 9000;
const port = process.env.PORT || DEFAULT_PORT;

(async() => {

  await mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

  // Start express App
  await app.listen(port);
  console.warn(`App listening on port ${port}...`);

})();

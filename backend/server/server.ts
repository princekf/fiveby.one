import * as mongoose from 'mongoose';
import populateDatabase from '../scripts/populateDatabase';
import populateDatabaseProducts from '../scripts/populateDatabase-products';
import app from './app';

const DEFAULT_PORT = 9000;
const url = process.env.MONGODB_URI || 'mongodb://localhost:27017/fivebyone_database';
const port = process.env.PORT || DEFAULT_PORT;

(async() => {

  // Connect to the database
  await mongoose.connect(url, {
    useNewUrlParser: true,
  });
  // Populate database with sample data if it's empty
  await populateDatabase();
  await populateDatabaseProducts();
  // Start express App
  app.listen(port);
  console.warn(`App listening on port ${port}...`);

})();

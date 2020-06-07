import app from './app';

const DEFAULT_PORT = 9000;
const port = process.env.PORT || DEFAULT_PORT;

(async() => {

  // Start express App
  await app.listen(port);
  console.warn(`App listening on port ${port}...`);

})();

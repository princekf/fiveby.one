import * as dotenv from 'dotenv';
import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as path from 'path';
import * as mongoose from 'mongoose';
import { AuthUtil } from './util/auth.util';


// Put dotenv in use before importing controllers
dotenv.config();
import {Routes} from './apiRoutes';


const url = process.env.MONGODB_URI || 'mongodb://localhost:27017/';

class App {

  public app: express.Application;

  /*
   * Public routes: Routes = new Routes();
   * Since database is defined at runtime, no need to provide the database name in mongo connection url.
   */

  constructor() {

    this.app = express();
    this.config();
    Routes.routes(this.app);
    mongoose.connect(url, {
      useNewUrlParser: true,
    });

  }

  private config(): void{

    // Support application/json type post data
    this.app.use(bodyParser.json());
    // Support application/x-www-form-urlencoded post data
    this.app.use(bodyParser.urlencoded({ extended: false }));

    AuthUtil.initPassports();

    // Declare the path to frontend's static assets
    this.app.use(express['static'](path.resolve('..', 'frontend', 'build')));

    // Intercept requests to return the frontend's static entry point
    this.app.get('*', (_request, response) => {

      response.sendFile(path.resolve('..', 'frontend', 'build', 'index.html'));

    });

  }

}


export default new App().app;

import * as dotenv from 'dotenv';
import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as path from 'path';
import { AuthUtil } from './util/auth.util';


// Put dotenv in use before importing controllers
dotenv.config();
import { Routes } from './apiRoutes';

class App {

  public app: express.Application;

  constructor() {

    this.app = express();
    this.config();

  }

  private config = (): void => {

    Routes.routes(this.app);
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

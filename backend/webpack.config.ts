import path = require('path');
import nodeExternals = require('webpack-node-externals');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const NodemonPlugin = require('nodemon-webpack-plugin');

const { NODE_ENV = 'production' } = process.env;
module.exports = {
  entry: './server/server.ts',
  mode: NODE_ENV,
  target: 'node',
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'server.js',
  },
  resolve: {
    extensions: [ '.webpack.js', '.web.js', '.ts', '.tsx', '.js' ],
  },
  module: {
    rules: [
      {
        test: /\.ts|\.tsx$/u,
        include: __dirname,
        use: [ 'ts-loader' ],
      },
    ],
  },
  externals: [ nodeExternals() ],
  plugins: [ new NodemonPlugin() ],
};

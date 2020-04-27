import * as bodyParser from "body-parser";
import * as express from "express";
import { authorize } from "../config";
import Product from "./product.model";

const router = express.Router();

router.route("/").get(authorize, async (_, response) => {
  const products = await Product.find();
  return response.status(200).json(products);
});

router.route("/").post(authorize, bodyParser.json(), async (request, response) => {
  try {
    const product = new Product(request.body);
    await product.save();
    return response.status(200).json("Product saved!");
  } catch (error) {
    return response.status(400).send(error);
  }
});

export default router;

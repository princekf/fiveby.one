import MongodbMemoryServer from "mongodb-memory-server";
import * as mongoose from "mongoose";
import * as request from "supertest";
import app from "../app";
import User from "../users/user.model";
import Product from "./product.model";

describe("/api/products tests", () => {

  const mongod = new MongodbMemoryServer();
  let token: string = "";

  // Connect to mongoose mock, create a test user and get the access token
  beforeAll(async () => {
    const uri = await mongod.getConnectionString();
    await mongoose.connect(uri, { useNewUrlParser: true });
    const user = new User();
    user.email = "test@email.com";
    user.setPassword("test-password");
    await user.save();
    const response = await request(app)
      .post("/api/users/login")
      .send({ email: "test@email.com", password: "test-password" });
    token = response.body.token;
  });

  // Remove test user, disconnect and stop database
  afterAll(async () => {
    await User.remove({});
    await mongoose.disconnect();
    await mongod.stop();
  });

  // Create a sample item
  beforeEach(async () => {
    const product = new Product();
    product.name = "product name";
    product.barcode = "product code";
    product.price = 1000;
    await product.save();
  });

  // Remove sample items
  afterEach(async () => {
    await Product.remove({});
  });

  it("should get products", async () => {
    const response = await request(app)
      .get("/api/products")
      .set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(200);
    expect(response.body).toEqual([expect.objectContaining({ name: "product name", price: 1000, barcode: "product code" })]);
  });

  it("should post products", async () => {
    const response = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "new product", price: 2000, barcode: "product barcode"});
    expect(response.status).toBe(200);
    expect(response.body).toBe("Product saved!");
  });

  it("should catch errors when posting products", async () => {
    const response = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${token}`)
      .send({});
    expect(response.status).toBe(400);
  });
});

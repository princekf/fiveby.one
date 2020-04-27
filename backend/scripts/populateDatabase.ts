import chalk from "chalk";
import Item from "../server/items/item.model";
import User from "../server/users/user.model";
import Product from "../server/products/product.model";

const populateDatabase = async () => {
  try {
    const users = await User.find({});
    const items = await Item.find({});
    if (users.length === 0 && items.length === 0) {
      console.log(chalk.yellow("No users or items in the database, creating sample data..."));
      const user = new User();
      user.email = "testerp@xpeditions.in";
      user.setPassword("Simple_123");
      await user.save();
      console.log(chalk.green("Sample user successfuly created!"));
      const newItems = [
        { name: "Paper clip", value: 0.1 },
        { name: "Colorful pen", value: 1.2 },
        { name: "Notebook", value: 2.5 },
        { name: "Soft eraser", value: 0.5 },
        { name: "Table lamp", value: 5.1 }
      ];
      await Item.insertMany(newItems);
      console.log(chalk.green(`${newItems.length} item(s) successfuly created!`));

      const newProducts:App.Product[] = [
        {name: "Kera Coconut Oil", price: 200, barcode:"909090"},
        {name: "Pavizham Unda Rice", price: 470, barcode:"808080"},
        {name: "Moden Milk Bread - Large", price: 45, barcode:"707070"},
        {name: "Muralya Milk - Packet", price: 24, barcode:"606060"}
      ]
      await Product.insertMany(newProducts);
      console.log(chalk.green(`${newProducts.length} products(s) successfuly created!`));
    } else {
      console.log(chalk.yellow("Database already initiated, skipping populating script"));
    }
  } catch (error) {
    console.log(chalk.red(error));
  }
};

export default populateDatabase;

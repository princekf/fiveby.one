import * as chalk from 'chalk';
import Product from '../server/products/product.model';

const populateDatabaseProducts = async() => {

  try {

    const products = await Product.find({});
    if (products.length === 0) {

      console.warn(chalk.yellow('No products in the database, creating sample products...'));

      const newProducts = [
        {
          barcode: 35200264013,
          name: 'Riceland American Jazmine Rice',
          price: 1397,
        },
        {
          barcode: 11111065925,
          name: 'Caress Velvet Bliss Ultra Silkening Beauty Bar - 6 Ct',
          price: 900,
        },
        {
          barcode: 23923330139,
          name: 'Earth\'s Best Organic Fruit Yogurt Smoothie Mixed Berry',
          price: 1452,
        },
        {
          barcode: 208528800007,
          name: 'Boar\'s Head Sliced White American Cheese - 120 Ct',
          price: 1457,
        },
        {
          barcode: 759283100036,
          name: 'Back To Nature Gluten Free White Cheddar Rice Thin Crackers',
          price: 323,
        },
        {
          barcode: 74170388732,
          name: 'Sally Hansen Nail Color Magnetic 903 Silver Elements',
          price: 1448,
        },
        {
          barcode: 70177154004,
          name: 'Twinings Of London Classics Lady Grey Tea - 20 Ct',
          price: 598,
        },
      ];
      await Product.insertMany(newProducts);
      console.warn(chalk.green(`${newProducts.length} products(s) successfuly created!`));

    } else {

      console.warn(chalk.yellow('Products already initiated, skipping populating script'));

    }

  } catch (error) {

    console.warn(chalk.red(error));

  }

};

export default populateDatabaseProducts;

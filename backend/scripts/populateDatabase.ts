import * as chalk from 'chalk';
import User from '../server/auth/user/user.model';

const populateDatabase = async() => {

  try {

    const users = await User.find({});
    if (users.length === 0) {

      console.warn(chalk.yellow('No users or items in the database, creating sample data...'));
      const user = new User();
      user.name = 'Test User';
      user.email = 'testerp@xpeditions.in';
      user.setPassword('Simple_123@');
      await user.save();
      console.warn(chalk.green('Sample user successfuly created!'));

    } else {

      console.warn(chalk.yellow('Database already initiated, skipping populating script'));

    }

  } catch (error) {

    console.warn(chalk.red(error));

  }

};

export default populateDatabase;

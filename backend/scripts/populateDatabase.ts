import * as chalk from 'chalk';
import User from '../server/auth/user/user.model';
import Company from '../server/auth/company/company.model';
import { Company as CompanyEntity } from 'fivebyone';

const createCompany = async(): Promise<CompanyEntity> => {

  const company = new Company();
  company.name = 'fiveBy.one';
  company.email = 'office@fiveByOne.org';
  company.addressLine1 = 'PMG Road';
  company.addressLine2 = 'Near Plamoodu';
  company.addressLine3 = 'PMG';
  company.addressLine4 = 'TVM';
  company.state = 'Kerala';
  company.country = 'India';
  company.pincode = '223344';
  company.contact = '1234567890';
  company.phone = '1234567890';
  await company.save();
  return company;

};

const populateDatabase = async() => {

  try {

    const users = await User.find({});
    if (users.length === 0) {

      console.warn(chalk.yellow('No users or items in the database, creating sample data...'));
      const company = await createCompany();
      const user = new User();
      user.name = 'Test User';
      user.email = 'testerp@xpeditions.in';
      user.setPassword('Simple_123@');
      user.company = company;
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

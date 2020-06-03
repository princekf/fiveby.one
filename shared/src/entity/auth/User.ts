import { Company } from '../auth/Company';

export interface UserS {
  company: Company;
  name: string;
  mobile: string;
  email: string;
  addressLine1: string;
  addressLine2: string;
  addressLine3: string;
  addressLine4: string;
  state: string;
  country: string;
  pinCode: string;
}

export interface User extends UserS {
  _id: string;
}

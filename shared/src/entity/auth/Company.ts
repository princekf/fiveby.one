export interface CompanyS {
  name: string;
  contact: string;
  phone: string;
  email: string;
  addressLine1: string;
  addressLine2: string;
  addressLine3: string;
  addressLine4: string;
  state: string;
  country: string;
  pincode: string;
}

export interface Company extends CompanyS {
  _id: string;
  code: string;
}

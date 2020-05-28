interface Address {
  type: string;
  addressLine1: string;
  addressLine2: string;
  addressLine3: string;
  addressLine4: string;
  state: string;
  country: string;
  pinCode: string;
  landMark: string;
}
interface RegistrationNumber {
  name: string;
  value: string;
}
export interface PartyS {
  name: string;
  code: string;
  mobile: string;
  email: string;
  isCustomer: boolean;
  isVendor: boolean;
  addresses: Address[];
  registrationNumbers: RegistrationNumber[];
}
export interface Party extends PartyS {
  _id: string;
}

interface FinYear {
  name: string;
  startDate: string;
  endDate: string;
}

export interface CompanyBranchS {
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
  finYears: FinYear[];
}

export interface CompanyBranch extends CompanyBranchS {
  _id: string;
}

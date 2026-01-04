
export interface Farmer {
  id: string;
  email: string;
  role: 'farmer';
  name: string;
  phone: string;
  nationalId: string;
  address: string;
  farmerId: string;
}

export interface Merchant {
  id: string;
  email: string;
  role: 'merchant';
  name: string;
  phone: string;
  businessName: string;
  businessType: string;
}

export interface Ranger {
  id: string;
  email: string;
  role: 'ranger';
  name: string;
  phone: string;
}

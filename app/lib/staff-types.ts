
// app/lib/staff-types.ts

/**
 * Defines the publicly-facing data structure for a Farmer.
 * This is the contract for the /api/staff/farmers endpoint.
 */
export interface Farmer {
  id: string;
  email: string;
  role: 'farmer';
  name?: string;
  phone?: string;
  nationalId?: string;
  address?: {
    village: string;
    commune: string;
    district: string;
    province: string;
    country: string;
  };
  farmerId?: string;
}

/**
 * Defines the publicly-facing data structure for a Ranger.
 */
export interface Ranger {
  id: string;
  email: string;
  role: 'ranger';
  name?: string;
  phone?: string;
}

/**
 * Defines the publicly-facing data structure for a Merchant.
 */
export interface Merchant {
  id: string;
  email: string;
  role: 'merchant';
  name?: string;
  phone?: string;
  businessName?: string;
  businessType?: string;
}

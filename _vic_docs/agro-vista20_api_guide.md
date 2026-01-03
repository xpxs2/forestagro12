
# API Integration Guide for `agro-vista20`

**To:** The `agro-vista20` Development Team  
**From:** The `forestagro-12` Project Team  
**Subject:** API Integration Guide for Accessing `forestagro-12` Staff Data

---

### **Version History**
- **v1.1 (Current):** Updated document with the definitive production base URL for the API endpoints.
- **v1.0:** Initial document creation with placeholder URLs.

---

This document provides the technical specifications for accessing staff data from the `forestagro-12` application.

### **CRITICAL: Change in Connection Method**

Please **do not** attempt to connect your sync scripts directly to the `forestagro-12` Firestore database. 

For security, stability, and to ensure a stable data contract, we have created a dedicated backend API. Your `dataSync.ts` script must be updated to make standard HTTPS requests to the secure endpoints detailed below. Direct database access will not work.

---

### **1. Authentication**

Every request to our API must be authenticated using a secret API key. You must include an `Authorization` header with every API call.

**Header Format:**
```
Authorization: Bearer <Your_API_Secret_Key>
```
*(The secret key will be provided to you securely by the `forestagro-12` project owner.)*

---

### **2. API Endpoints & URLs**

The definitive base URL for the API is: **`https://fa12-backend--forestagro-12.us-central1.hosted.app`**

#### **Endpoint: Get Farmer Data**
- **Method:** `GET`
- **URL:** `https://fa12-backend--forestagro-12.us-central1.hosted.app/api/staff/farmers`

#### **Endpoint: Get Ranger Data**
- **Method:** `GET`
- **URL:** `https://fa12-backend--forestagro-12.us-central1.hosted.app/api/staff/rangers`

#### **Endpoint: Get Merchant Data**
- **Method:** `GET`
- **URL:** `https://fa12-backend--forestagro-12.us-central1.hosted.app/api/staff/merchants`

---

### **3. Example Request Code (JavaScript)**

Here is a sample JavaScript `fetch` call demonstrating how to correctly call an endpoint. 

```javascript
// This should be loaded securely from your environment, not hardcoded.
const STAFF_API_SECRET_KEY = 'PASTE_YOUR_SECRET_KEY_HERE';

const farmerApiUrl = 'https://fa12-backend--forestagro-12.us-central1.hosted.app/api/staff/farmers';

async function fetchFarmerData() {
  try {
    const response = await fetch(farmerApiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${STAFF_API_SECRET_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API Error: ${response.status} - ${errorData.error || 'Unknown error'}`);
    }

    const data = await response.json();
    console.log('Successfully fetched farmers:', data.farmers);
    // You can now use the data.farmers array in your application.
    return data.farmers;

  } catch (error) {
    console.error("Failed to fetch farmer data:", error);
  }
}

// Run the function to get the data
fetchFarmerData();
```

---

### **4. Response Data Format**

The API will respond with a JSON object. The data you need will be in an array (`farmers`, `rangers`, or `merchants`). The structure for each is defined below.

#### `/api/staff/farmers` Response Structure:
```json
{
  "farmers": [
    {
      "id": "string",
      "email": "string",
      "role": "farmer",
      "name": "string (optional)",
      "phone": "string (optional)",
      "nationalId": "string (optional)",
      "address": {
        "village": "string",
        "commune": "string",
        "district": "string",
        "province": "string",
        "country": "string"
      },
      "farmerId": "string (optional)"
    }
  ]
}
```

#### `/api/staff/rangers` Response Structure:
```json
{
  "rangers": [
    {
      "id": "string",
      "email": "string",
      "role": "ranger",
      "name": "string (optional)",
      "phone": "string (optional)"
    }
  ]
}
```

#### `/api/staff/merchants` Response Structure:
```json
{
  "merchants": [
    {
      "id": "string",
      "email": "string",
      "role": "merchant",
      "name": "string (optional)",
      "phone": "string (optional)",
      "businessName": "string (optional)",
      "businessType": "string (optional)"
    }
  ]
}
```

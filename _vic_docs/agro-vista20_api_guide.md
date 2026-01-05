# API Integration Guide for `agro-vista20`

**To:** The `agro-vista20` Development Team  
**From:** The `forestagro-12` Project Team  
**Subject:** **[UPDATED]** API Integration Guide for `forestagro-12`

---

### **Version History**
- **v2.0 (Current):** Complete API redesign. Deprecated all old `GET` endpoints in favor of a single, secure `POST` endpoint. Added user management and data update capabilities.
- **v1.1:** Updated document with the definitive production base URL.
- **v1.0:** Initial document creation.

---

### **CRITICAL: Major API Change (v2.0)**

This document outlines the **new, mandatory API protocol.** All previous endpoints (e.g., `/api/staff/farmers`) are now **deprecated and non-functional**.

To enhance security and functionality, we have moved to a single, centralized API endpoint. All interactions are now handled via a `POST` request to this new endpoint, using a structured request body to specify the desired action.

---

### **1. Authentication**

Authentication is now a two-layer process to ensure maximum security.

#### **a) Application Authentication**
Every request to our API must still be authenticated with the secret API key.

**Header Format:**
```
Authorization: Bearer <Your_API_Secret_Key>
```
*(The secret key will be provided to you securely by the `forestagro-12` project owner.)*

#### **b) Staff User Context**
In addition to the header, the body of every `POST` request **must** contain a `staffUser` object. This object tells our system which staff member is performing the action, allowing us to enforce country-specific data access rules.

**`staffUser` Object Structure:**
```json
{
  "staffUser": {
    "id": "the-unique-id-of-the-logged-in-staff-member",
    "country": "the-country-of-the-logged-in-staff-member"
  }
}
```

---

### **2. The Central API Endpoint**

- **Method:** `POST`
- **URL:** `https://fa12-backend--forestagro-12.us-central1.hosted.app/api/external/staff`

---

### **3. Request Body Structure**

All `POST` requests to the central endpoint must send a JSON body with the following structure:

```json
{
  "staffUser": { ... },
  "action": "the-action-you-want-to-perform",
  "payload": { ... }
}
```
- **`staffUser`**: (Required) The context object described in the authentication section.
- **`action`**: (Required) A string that specifies the operation to be performed.
- **`payload`**: (Optional) An object containing the data needed for the specific action.

---

### **4. Actions & Payloads**

Here are the available `actions` and the required `payload` for each.

#### **Read Actions**
- **Action:** `get_farmers`
  - **Description:** Fetches a list of all farmers within the staff user's country.
  - **Payload:** `null`
  - **Success Response:** `{"farmers": [...]}`

- **Action:** `get_rangers`
  - **Description:** Fetches a list of all rangers within the staff user's country.
  - **Payload:** `null`
  - **Success Response:** `{"rangers": [...]}`

- **Action:** `get_merchants`
  - **Description:** Fetches a list of all merchants within the staff user's country.
  - **Payload:** `null`
  - **Success Response:** `{"merchants": [...]}`

#### **Write Actions**
- **Action:** `set_user_state`
  - **Description:** Enables or disables a user account in the `forestagro-12` system.
  - **Payload:** `{ "userId": "the_id_of_the_user_to_modify", "disabled": true | false }`
  - **Success Response:** `{"success": true, "message": "User state updated."}`

- **Action:** `update_farmer_crops`
  - **Description:** Adds or updates the crop data for a specific farmer.
  - **Payload:** `{ "farmerId": "the_id_of_the_farmer", "data": { /* your crop data object */ } }`
  - **Success Response:** `{"success": true, "message": "Farmer cropData updated."}`

- **Action:** `update_farmer_activities`
  - **Description:** Adds or updates the practice activities for a specific farmer.
  - **Payload:** `{ "farmerId": "the_id_of_the_farmer", "data": { /* your activity data object */ } }`
  - **Success Response:** `{"success": true, "message": "Farmer practiceActivities updated."}`

---

### **5. Example Request Code (JavaScript)**

Here are sample `fetch` calls for a few key actions.

**Example 1: Fetching Farmers**
```javascript
const STAFF_API_SECRET_KEY = 'PASTE_YOUR_SECRET_KEY_HERE';
const API_URL = 'https://fa12-backend--forestagro-12.us-central1.hosted.app/api/external/staff';

async function fetchFarmers(staffUser) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${STAFF_API_SECRET_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      staffUser: staffUser,
      action: 'get_farmers',
      payload: null
    })
  });
  const data = await response.json();
  console.log(data.farmers);
  return data.farmers;
}

// Example usage:
// const currentUser = { id: 'staff_abc_123', country: 'Cambodia' };
// fetchFarmers(currentUser);
```

**Example 2: Disabling a User**
```javascript
async function setUserState(staffUser, userId, isDisabled) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${STAFF_API_SECRET_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      staffUser: staffUser,
      action: 'set_user_state',
      payload: {
        userId: userId,
        disabled: isDisabled
      }
    })
  });
  const data = await response.json();
  console.log(data.message);
  return data;
}

// Example usage:
// const currentUser = { id: 'staff_abc_123', country: 'Cambodia' };
// const userToDisable = 'farmer_xyz_789';
// setUserState(currentUser, userToDisable, true);
```

---

### **6. Response Data Structures**

The data structures for `farmers`, `rangers`, and `merchants` within the response remain the same as the previous version of this guide. Please refer to your existing parsing logic for those objects.

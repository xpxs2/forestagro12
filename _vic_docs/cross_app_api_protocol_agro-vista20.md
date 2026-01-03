
# Protocol Proposal: Cross-App API for Agro-Vista20

**Date:** 2024-05-24

**Objective:** This document contains the user's specific request for a cross-application API and the detailed protocol proposed for its implementation.

---

## SECTION 1: User Requirement

*This section contains the user's verbatim prompt.*

> "require to work on an API to give full access to another app connect.
>
> the other app is this: https://studio.firebase.google.com/agro-vista20-44092715
>
> this is the staff user app. they require to read all farmer's data, ranger's and merchants who's profile is the same country as the log-in staff using agrovista20 web-app. require to enable and disable users in forestagro-12 app.
>
> no coding, reply deep discuss."

---

## SECTION 2: Deep Discussion & Proposed Protocol

*This section contains the detailed discussion notes and proposed solution in response to the user's prompt.*

### 2a. The Core Architectural Challenge: Cross-Project Trust

The fundamental problem we need to solve is establishing **trust** between your two distinct Firebase projects:

*   **`forestagro-12` (The Data Source):** This project holds the sensitive farmer, ranger, and merchant data in its Firestore database. Its security rules are designed to protect data based on the roles *within that project*.
*   **`agro-vista20` (The Data Consumer):** This is the "staff app." Its users are a separate class of user. A request from a user on the `agro-vista20` web app to the `forestagro-12` database would be anonymous and rightly rejected by security rules.

### 2b. The Solution: A Privileged Backend-to-Backend API

The correct solution is **not** to connect the `agro-vista20` frontend directly to the `forestagro-12` database. Instead, we will build a new, special-purpose API within the `forestagro-12` backend. This API will act as a secure and controlled data broker.

**The Data Flow:**

1.  **Staff User Authenticates:** A staff member logs into the `agro-vista20` web app.
2.  **`agro-vista20` Backend Call:** The `agro-vista20` frontend asks its *own* backend for the farmer data.
3.  **Secure Server-to-Server Call:** The `agro-vista20` backend, now knowing the staff user is legitimate and knowing their country, makes a highly privileged, secure call to the new API endpoint we will build in `forestagro-12`.
4.  **`forestagro-12` API Validates & Fetches:** The `forestagro-12` API receives the request. It validates that the request is coming from a trusted source (the `agro-vista20` backend) and then performs the database query based on the country provided.
5.  **Data Returned:** The data flows back along the same secure channel, from `forestagro-12` -> `agro-vista20` backend -> `agro-vista20` frontend.

This architecture ensures that all access to the sensitive `forestagro-12` data is intermediated, logged, and controlled by a single, secure entry point.

### 2c. The Authentication Mechanism: Service Accounts

Trust between the two backends will be established using a **Google Cloud Service Account**.

1.  **Creation:** We will create a new Service Account within the `agro-vista20` Google Cloud project.
2.  **Permissions (IAM):** We will then go to the `forestagro-12` Google Cloud project and grant that *specific* Service Account permission to read from the Firestore database by assigning it the **"Cloud Datastore User"** role. This adheres to the **Principle of Least Privilege** by providing read-only access.
3.  **Authentication:** The `agro-vista20` backend will use the credentials of this Service Account to automatically generate a secure identity token with every API call it makes. The `forestagro-12` backend can then cryptographically verify this token to be 100% certain the request is legitimate.

### 2d. API Design and Data Filtering

We will design new API endpoints within the `forestagro-12` project, likely in the `/pages/api/` directory.

**Endpoint Design:**
*   `GET /api/staff/farmers?country=<country_code>`
*   `GET /api/staff/rangers?country=<country_code>`
*   `GET /api/staff/merchants?country=<country_code>`

**Filtering Logic:**

The code inside the `forestagro-12` API endpoint will:
1.  Verify the request is from the trusted Service Account.
2.  Extract the `country` parameter from the URL.
3.  Use the **Firebase Admin SDK** (which has privileged database access) to query the `users` collection: `.where('role', '==', 'farmer').where('country', '==', '<country_code>')`.
4.  Return the results as a JSON array.

### 2e. Data Model Prerequisite

This entire strategy hinges on one critical assumption about your data model in `forestagro-12`: **Every farmer, ranger, and merchant document in your Firestore `users` collection must have a `country` field.** If this field does not exist, a data migration to add it to all existing user profiles would be the first necessary step.

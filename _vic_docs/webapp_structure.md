# Web Application Structure

This chart outlines the primary sections and routes of your application, showing how different user roles (Farmers, Rangers, Merchants) interact with the platform.

/
|
|--- / (Login & Landing Page)
|
|--- /farmers
|    |
|    |--- /dashboard -------------------- (Main dashboard for farmers)
|    |    |--- /profile ------------------ (Farmer's profile page)
|    |
|    |--- /plots
|         |--- /new-plot --------------- (Form to create a new plot)
|         |
|         |--- /[plotId] --------------- (Details for a specific plot)
|              |--- /land-use ----------- (Manage land use, crops, etc.)
|              |--- /practices ---------- (Log and view farming practices)
|              |--- /mrv ---------------- (View MRV-related data & reports)
|
|--- /rangers
|    |
|    |--- /dashboard -------------------- (Main dashboard for rangers)
|    |    |--- /farmer-management ------ (View and manage farmers)
|    |    |--- /task-assignment -------- (Assign tasks to farmers)
|
|--- /merchants
|    |
|    |--- /dashboard -------------------- (Main dashboard for merchants)
|         |--- /market-data ------------ (View market prices, trends, etc.)
|         |--- /farmer-network --------- (View farmers & their products)
|
|--- /api ------------------------------ (Backend API routes)
     |--- /users
     |    |--- /[userId]
     |         |--- /plots ------------- (API to get a user's plots)
     |
     |--- /plots ------------------------ (General plot-related API routes)



//KEY SECTIONS EXPLAINED
Farmer Section (/farmers): This is the core of the application, where farmers can manage their farm data. The dashboard gives them an overview, and they can drill down into each plot to manage its details. The land-use, practices, and mrv sections help them organize their data for sustainability and market access.
Ranger Section (/rangers): This section is for field staff who support farmers. Rangers can view farmer data, assign tasks (like soil testing or training), and monitor progress.
Merchant Section (/merchants): This section is for buyers and other market actors. They can view anonymized and aggregated data to understand what products are available and connect with farmers.
API (/api): These are the backend routes that the web application uses to communicate with the database. The API is secured by the Firestore rules you've been working on, ensuring that users can only access the data they are authorized to see.
This structure allows for clear separation of concerns, with each user role having its own dedicated section of the application. The API provides the necessary data to each section while respecting the security rules you've put in place.
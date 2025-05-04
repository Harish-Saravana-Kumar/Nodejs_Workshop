📦 E-Commerce Product Catalog API (GraphQL + Node.js)
This project is a simple and scalable GraphQL API built using Node.js, Express.js, and MongoDB for managing an E-Commerce product catalog. It supports CRUD operations (Create, Read, Update, Delete), filtering, and pagination.

🚀 Features
📦 Add, view, update, and delete products.

🔍 Query products with filters and pagination (to be implemented).

⚙️ GraphQL schema with queries and mutations.

📊 MongoDB integration using Mongoose.

🧪 Built-in GraphiQL interface for testing queries/mutations.

🛠️ Tech Stack
Node.js

Express.js

GraphQL

MongoDB + Mongoose

express-graphql

📁 Project Structure

.
├── index.js            # Main server file
├── models/
│   └── Product.js      # Mongoose model for products
├── README.md           # Project documentation
└── package.json

📥 Installation
1. Clone the repository
git clone https://github.com/your-username/graphql-ecommerce-api.git
cd graphql-ecommerce-api

2. Install dependencies
npm install
Configure MongoDB URI

3. In index.js, update the following with your MongoDB URI:
const mongoURI = "mongodb+srv://<username>:<password>@cluster.mongodb.net/your-db";

4. Start the server
node index.js

5. Open GraphiQL in browser
http://localhost:4000/graphql

✅ Example GraphQL Queries
1. 🔍 Fetch all products
query {
  products {
    id
    name
    description
    price
    category
    brand
    inStock
  }
}

2. ➕ Add a new product
graphql
Copy
Edit
mutation {
  addProduct(
    name: "Smartphone",
    description: "High-end phone",
    price: 999.99,
    category: "Electronics",
    brand: "BrandX",
    inStock: 20
  ) {
    id
    name
  }
}

🔧 To Do
 Add filtering by category/price/brand

 Add pagination support

 Implement update/delete mutations

 Add user authentication and role-based access

👨‍💻 Author
Name: Harish S
College/Institution: Sri Eshwar College of Engineering 
Project Type: College Assignment

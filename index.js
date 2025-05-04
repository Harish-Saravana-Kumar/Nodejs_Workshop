const express = require("express");
const { graphqlHTTP } = require("express-graphql");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLInt,
  GraphQLFloat,
  GraphQLID,
  GraphQLNonNull,
} = require("graphql");

const app = express();

// MongoDB connection
// MongoDB connection
const mongoURI = "mongodb+srv://malarharish007:HfouQrSaDLxdtjRj@paperdb.g0ntrdh.mongodb.net/?retryWrites=true&w=majority&appName=paperdb";
mongoose
  .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

// Mongoose Product Model
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  brand: { type: String, required: true },
  inStock: { type: Number, required: true },
});

const Product = mongoose.model("Product", productSchema);

// Mongoose User Model for Authentication
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: "user" }, // 'user' or 'admin'
});

const User = mongoose.model("User", userSchema);

// GraphQL Types
const productType = new GraphQLObjectType({
  name: "Product",
  fields: {
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    description: { type: GraphQLString },
    price: { type: GraphQLFloat },
    category: { type: GraphQLString },
    brand: { type: GraphQLString },
    inStock: { type: GraphQLInt },
  },
});

const userType = new GraphQLObjectType({
  name: "User",
  fields: {
    id: { type: GraphQLID },
    username: { type: GraphQLString },
    role: { type: GraphQLString },
  },
});

// GraphQL Queries and Mutations

// Authentication Middleware (Optional)
const authenticateUser = (token) => {
  try {
    if (!token) {
      throw new Error("Authentication failed");
    }
    return jwt.verify(token, "secret_key");
  } catch (err) {
    throw new Error("Authentication failed");
  }
};

// Root Query
const rootQuery = new GraphQLObjectType({
  name: "Query",
  fields: {
    products: {
      type: new GraphQLList(productType),
      description: "List of all products with optional filters and pagination",
      args: {
        category: { type: GraphQLString },
        priceMin: { type: GraphQLFloat },
        priceMax: { type: GraphQLFloat },
        sortBy: { type: GraphQLString }, // 'price', 'name', etc.
        sortOrder: { type: GraphQLString }, // 'asc', 'desc'
        page: { type: GraphQLInt },
        pageSize: { type: GraphQLInt },
      },
      resolve: async (parent, args) => {
        try {
          let query = {};
          if (args.category) query.category = args.category;
          if (args.priceMin) query.price = { $gte: args.priceMin };
          if (args.priceMax) query.price = { $lte: args.priceMax };

          let sort = {};
          if (args.sortBy) sort[args.sortBy] = args.sortOrder === "desc" ? -1 : 1;

          const page = args.page || 1;
          const pageSize = args.pageSize || 10;
          const skip = (page - 1) * pageSize;

          return await Product.find(query).skip(skip).limit(pageSize).sort(sort);
        } catch (err) {
          console.log(err);
        }
      },
    },
    product: {
      type: productType,
      description: "Get a single product by ID",
      args: { id: { type: GraphQLID } },
      resolve: async (parent, args) => {
        try {
          const product = await Product.findById(args.id);
          if (!product) throw new Error("Product not found");
          return product;
        } catch (err) {
          console.log(err);
        }
      },
    },
    me: {
      type: userType,
      description: "Get the authenticated user's profile",
      resolve: async (parent, args, context) => {
        const user = authenticateUser(context.token);
        return await User.findById(user.id);
      },
    },
  },
});

// GraphQL Mutations
const Mutation = new GraphQLObjectType({
  name: "Mutation",
  fields: {
    addProduct: {
      type: productType,
      description: "Add a new product",
      args: {
        name: { type: GraphQLString },
        description: { type: GraphQLString },
        price: { type: GraphQLFloat },
        category: { type: GraphQLString },
        brand: { type: GraphQLString },
        inStock: { type: GraphQLInt },
      },
      resolve: async (parent, args) => {
        const newProduct = new Product({
          name: args.name,
          description: args.description,
          price: args.price,
          category: args.category,
          brand: args.brand,
          inStock: args.inStock,
        });
        return await newProduct.save();
      },
    },
    updateProduct: {
      type: productType,
      description: "Update an existing product",
      args: {
        id: { type: GraphQLID },
        name: { type: GraphQLString },
        description: { type: GraphQLString },
        price: { type: GraphQLFloat },
        category: { type: GraphQLString },
        brand: { type: GraphQLString },
        inStock: { type: GraphQLInt },
      },
      resolve: async (parent, args) => {
        const updatedProduct = await Product.findByIdAndUpdate(
          args.id,
          {
            name: args.name,
            description: args.description,
            price: args.price,
            category: args.category,
            brand: args.brand,
            inStock: args.inStock,
          },
          { new: true }
        );
        return updatedProduct;
      },
    },
    deleteProduct: {
      type: productType,
      description: "Delete a product",
      args: { id: { type: GraphQLID } },
      resolve: async (parent, args) => {
        const deletedProduct = await Product.findByIdAndDelete(args.id);
        if (!deletedProduct) throw new Error("Product not found");
        return deletedProduct;
      },
    },
    signup: {
      type: userType,
      description: "Sign up a new user",
      args: {
        username: { type: GraphQLString },
        password: { type: GraphQLString },
      },
      resolve: async (parent, args) => {
        const hashedPassword = await bcrypt.hash(args.password, 10);
        const newUser = new User({
          username: args.username,
          password: hashedPassword,
        });
        return await newUser.save();
      },
    },
    login: {
      type: userType,
      description: "Login and get a JWT token",
      args: {
        username: { type: GraphQLString },
        password: { type: GraphQLString },
      },
      resolve: async (parent, args) => {
        const user = await User.findOne({ username: args.username });
        if (!user) throw new Error("User not found");

        const validPassword = await bcrypt.compare(args.password, user.password);
        if (!validPassword) throw new Error("Invalid credentials");

        const token = jwt.sign({ id: user.id }, "secret_key", { expiresIn: "1h" });
        return { id: user.id, username: user.username, role: user.role, token };
      },
    },
  },
});

const schema = new GraphQLSchema({
  query: rootQuery,
  mutation: Mutation,
});

// Middleware for authentication (JWT)
app.use((req, res, next) => {
  const token = req.headers["authorization"];
  req.token = token || "";
  next();
});

// GraphQL HTTP endpoint
app.use(
  "/graphql",
  graphqlHTTP({
    schema: schema,
    graphiql: true,
  })
);

// Start the server
app.listen(4000, () => {
  console.log("Server running on port 4000");
});

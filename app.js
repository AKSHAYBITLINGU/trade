const express = require("express");
const ejs = require("ejs");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");
const bodyParser = require("body-parser");
const app = express();
const mongoose = require("mongoose");
const User = require("./models/user");
const cookieParser = require("cookie-parser");
const checkAuth = require("./middlewares/checkAuth");
var jwt = require("jsonwebtoken");
const Grid = require("gridfs-stream");
const multer = require("multer");
require("dotenv").config();
const secretKey = process.env.JWT_SECRET_KEY;
const session = require("express-session");
const MongoStore = require("connect-mongo");

const uri = process.env.uri;
const port = process.env.PORT;
//connection
// const options = {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
//   tls: true,  // Enable TLS/SSL
//   tlsCAFile: process.env.MONGODB_CA_FILE,  // Path to CA file if needed
//   connectTimeoutMS: 30000,  // 30 seconds connection timeout
//   socketTimeoutMS: 30000,   // 30 seconds socket timeout
// };

// mongoose.connect(uri, options)
//   .then(() => console.log('Successfully connected to MongoDB'))
//   .catch(err => {
//     console.error('Error connecting to MongoDB:', err);
//     if (err.name === 'MongoNetworkError' || err.name === 'MongoServerSelectionError') {
//       console.error('Network-related error. Please check your network connection and MongoDB server configuration.');
//     }
//   });

// const { MongoClient, ServerApiVersion } = require('mongodb');

// // Create a MongoClient with a MongoClientOptions object to set the Stable API version
// const client = new MongoClient(uri, {
//   serverApi: {
//     version: ServerApiVersion.v1,
//     strict: true,
//     deprecationErrors: true,
//   },
//   serverSelectionTimeoutMS: 5000,
//     socketTimeoutMS: 45000,
//     connectTimeoutMS: 10000
// });

// async function run() {
//   try {
//     // Connect the client to the server	(optional starting in v4.7)
//     await client.connect();
//     // Send a ping to confirm a successful connection
//     await client.db("admin").command({ ping: 1 });
//     console.log("Pinged your deployment. You successfully connected to MongoDB!");
//   } finally {
//     // Ensures that the client will close when you finish/error
//     await client.close();
//   }
// }
// run().catch(console.dir);
// const db = mongoose.connection;
// db.on('error', (err) => {
//     console.error('MongoDB connection error:', err);
// });
// db.once('open', function() {
//     console.log("Connected to MongoDB!");
// });

//let gfs;

// mongoose.connection.once("open", () => {
//   gfs = Grid(mongoose.connection.db, mongoose.mongo);
//   gfs.collection("uploads");
// });

// // Set up Multer for file upload
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "./uploads/");
//   },
//   filename: function (req, file, cb) {
//     cb(
//       null,
//       file.fieldname + "-" + Date.now() + path.extname(file.originalname)
//     );
//   },
// });

// const upload = multer({ storage });
mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(
  session({
    secret: secretKey, // Replace with a secret key for session encryption
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
      mongoUrl: uri,
      collectionName: "sessions",
    }),
  })
);

// Set views directory for EJS templates
app.set("views", path.join(__dirname, "views"));

// Set EJS as the templating engine
app.set("view engine", "ejs");
app.use(express.static("public"));
// Use static middleware for public assets
app.use(express.static(path.join(__dirname, "public")));

// Body parser middleware (for future shopping cart)
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser()); // For reading cookies
app.use(checkAuth); // Use the checkAuth middleware for all routes

// Path to users.json file
const usersFilePath = path.join(__dirname, "users.json");

// Define routes (refer to separate files)
const HomePageRouter = require("./routes/categories");
const trainingPageRouter = require("./routes/training");
const SubCatRouter = require("./routes/subcategories");
const checkoutRouter = require("./routes/checkout");
const uploadRouter = require("./routes/upload");
const dealsRouter = require("./routes/deals");
const indexRouter = require("./routes/homepage");
const cartRoute = require("./routes/cart");
const loginRoute = require("./routes/login");
const signupRoute = require("./routes/signup");
const verifyRouter = require("./routes/verify");
const contactRouter = require("./routes/contact");
const aboutRouter = require("./routes/about");
const profileRouter = require("./routes/profile");
const myordersRouter = require("./routes/myorders");
const apidataRouter = require("./routes/apidata");

app.use("/cat", HomePageRouter);
app.use("/training", trainingPageRouter);
app.use("/sub", SubCatRouter);
app.use("/checkout", checkoutRouter);
app.use("/upload", uploadRouter);
app.use("/deals", dealsRouter);
app.use("/api", apidataRouter);
app.use("/myorders", myordersRouter);
app.use("/profile", profileRouter);
app.use("/about", aboutRouter);
app.use("/contact", contactRouter);
app.use("/signup/verify", verifyRouter);
app.use("/cart", cartRoute);
app.use("/login", loginRoute);
app.use("/signup", signupRoute);
app.use("/", indexRouter);

const Category = require("./models/categories");
const SubCategory = require("./models/subcategories");
const Product = require("./models/product");

app.post("/signup", async (req, res) => {
  const { username, password, phone } = req.body;

  try {
    // Check if the username already exists in MongoDB
    const userExists = await User.findOne({ username });
    if (userExists) {
      return res.status(400).json({ message: "Username already exists." });
    }
    req.session.phone = phone;
    req.session.username = username;
    req.session.password = password;

    return res.redirect("/signup/verify");
  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({ message: "Internal Server Error." });
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (user && (await user.comparePassword(password))) {
      // Generate JWT token
      const token = jwt.sign({ userId: user._id }, secretKey, {
        expiresIn: "24h",
      });
      // Set a secure cookie with the JWT token
      res.cookie("jwtToken", token, { httpOnly: true, maxAge: 3600000 });
      return res.redirect("/");
    } else {
      return res.status(400).json({ message: "Invalid username or password." });
    }
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Internal Server Error." });
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie("jwtToken"); // Clear the cookie
  res.redirect("/");
});

// const { Category } = require('./models/categories'); // Import the Category model
// const { SubCategory } = require('./models/subcategories'); // Import the SubCategory model
// const { Product } = require('./models/product'); // Import the Product model

async function linkSubCategoryToCategory(
  categoryName,
  subCategoryName,
  subCategoryImage = "default-image"
) {
  try {
    // Find the category by name
    const category = await Category.findOne({ name: categoryName });

    if (!category) {
      console.log(`Category "${categoryName}" not found.`);
      return;
    }

    // Find the subcategory by name
    let subcategory = await SubCategory.findOne({ name: subCategoryName });

    if (!subcategory) {
      // If the subcategory doesn't exist, create a new one
      subcategory = new SubCategory({
        name: subCategoryName,
        image: subCategoryImage,
      });
      await subcategory.save(); // Save the new subcategory
    }

    // Check if the subcategory is already linked to the category
    const isSubCategoryLinked = category.subcategories.includes(
      subcategory._id
    );

    if (!isSubCategoryLinked) {
      // If not linked, add the subcategory to the category's subcategories
      category.subcategories.push(subcategory._id);

      await category.save(); // Save the changes to the category

      console.log(
        `SubCategory "${subCategoryName}" linked to Category "${categoryName}".`
      );
    } else {
      console.log(
        `SubCategory "${subCategoryName}" is already linked to Category "${categoryName}".`
      );
    }
  } catch (error) {
    console.error("Error linking subcategory to category:", error);
  }
}
// linkSubCategoryToCategory('Electronics', 'Electronics2', 'Electronics2');
async function linkProductToSubCategory(
  subCategoryName,
  productId,
  productName,
  productPrice,
  productQuantity,
  productImage = "default-image"
) {
  try {
    // Find the subcategory by name
    const subcategory = await SubCategory.findOne({ name: subCategoryName });

    if (!subcategory) {
      console.log(`SubCategory "${subCategoryName}" not found.`);
      return;
    }

    // Find the product by name within the subcategory
    let product = await Product.findOne({ name: productName });

    if (!product) {
      // If the product doesn't exist, create a new one
      product = new Product({
        id: productId,
        name: productName,
        price: productPrice,
        quantity: productQuantity,
        image: productImage,
      });

      await product.save(); // Save the new product
    }

    // Check if the product is already linked to the subcategory
    const isProductLinked = subcategory.products.includes(product._id);

    if (!isProductLinked) {
      // If not linked, add the product to the subcategory's products
      subcategory.products.push(product._id);

      await subcategory.save(); // Save the changes to the subcategory

      console.log(
        `Product "${productName}" linked to SubCategory "${subCategoryName}".`
      );
    } else {
      console.log(
        `Product "${productName}" is already linked to SubCategory "${subCategoryName}".`
      );
    }
  } catch (error) {
    console.error("Error linking product to subcategory:", error);
  }
}

// linkProductToSubCategory('Fruits',111,'Apple', 40, 5500, 'Apple');

// Start the server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
  mongoose.connect(uri).then(() => {
    console.log("Database Connected");
  });
});

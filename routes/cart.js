const express = require("express");
const fs = require("fs");
const path = require("path");
const Product  = require("../models/product");
const User = require("../models/user");
const checkAuth = require("../middlewares/checkAuth");
const mongoose = require("mongoose");

const router = express.Router();
router.use(checkAuth);

// Define the path to the cart.json file
const cartJsonPath = path.join(__dirname, "../cart.json");
const productsJsonPath = path.join(__dirname, "../products.json");

// Route handler for rendering the cart page
router.get("/", async (req, res) => {
  try {
    // Check if the user is logged in
    if (!res.locals.isLoggedIn) {
      return res.redirect("/login"); // Redirect if user is not logged in
    }
    if (!req.user || !req.user.userId) {
      console.error("Error: req.user or req.user._id is undefined");
      return res.redirect("/login"); // Redirect if there's an issue with user data
    }

    const userId = req.user.userId; // Get the user's ID from the decoded token
    const user = await User.findById(userId); // Use findById with the correct value

    if (!user) {
      return res.status(404).send("User not found"); // Handle user not found case
    }

    const cartItems = user.cart; // Get the cart items

    // Render the cart view with the cart items
    res.render("cart", { cartItems, isLoggedIn: res.locals.isLoggedIn });
  } catch (error) {
    console.error("Error fetching user cart:", error);
    return res.status(500).send("Internal Server Error"); // Handle server errors
  }
});

// router.post('/add', (req, res) => {
//   const { id, name, price, image, quantity, total_price } = req.body;
//   // Read products.json to update product quantity
//   fs.readFile(productsJsonPath, 'utf8', (err, data) => {
//     if (err) {
//       console.error('Error reading products.json:', err);
//       return res.status(500).send('Internal Server Error');
//     }

//     let products;
//     try {
//       products = JSON.parse(data);
//     } catch (parseError) {
//       console.error('Error parsing products.json:', parseError);
//       return res.status(500).send('Internal Server Error');
//     }
//     let productFound = false;
//     // Find the product by ID and decrease its quantity
//     for (const subcategory in products) {
//       // Check if the property belongs to the object itself, not its prototype
//       if (products.hasOwnProperty(subcategory)) {
//         // Find the product in the current subcategory
//         const product = products[subcategory].find((p) => p.id == id);
//         console.log(products[subcategory]);
//         if (product) {
//           productFound = true;
//           if (product.quantity >= quantity) {
//             product.quantity -= quantity; // Decrease the stock
//           } else {
//             return res.status(400).send('Insufficient quantity in stock');
//           }
//           break; // Exit the loop once the product is found
//         }
//       }
//     }

//     if (!productFound) {
//       return res.status(404).send('Product not found');
//     }

//     // Write updated products.json back to disk
//     fs.writeFile(productsJsonPath, JSON.stringify(products, null, 2), 'utf8', (writeErr) => {
//       if (writeErr) {
//         console.error('Error writing to products.json:', writeErr);
//         return res.status(500).send('Internal Server Error');
//       }

//       // Now update the cart.json
//       fs.readFile(cartJsonPath, 'utf8', (readErr, cartData) => {
//         if (readErr) {
//           console.error('Error reading cart.json:', readErr);
//           return res.status(500).send('Internal Server Error');
//         }

//         let cartItems = [];
//         try {
//           cartItems = JSON.parse(cartData);
//         } catch (parseError) {
//           console.error('Error parsing cart.json:', parseError);
//           cartItems = [];
//         }

//         // Find the product in the cart and update it if it already exists
//         const cartProduct = cartItems.find((item) => item.id === id);

//         if (cartProduct) {
//           cartProduct.quantity += quantity;
//           cartProduct.total_price = cartProduct.price * cartProduct.quantity;
//         } else {
//           const newCartItem = {
//             id,
//             name,
//             image,
//             price,
//             quantity,
//             total_price,
//           };

//           cartItems.push(newCartItem);
//         }

//         // Write the updated cart.json
//         fs.writeFile(cartJsonPath, JSON.stringify(cartItems, null, 2), 'utf8', (writeErr) => {
//           if (writeErr) {
//             console.error('Error writing to cart.json:', writeErr);
//             return res.status(500).send('Internal Server Error');
//           }

//           res.status(200).send('Product added to cart'); // Success response
//         });
//       });
//     });
//   });
// });

router.post("/add", async (req, res) => {
  const { id, name, price, image, quantity, total_price } = req.body;
  try {
    if (!res.locals.isLoggedIn) {
      //return res.status(400).json({ message: 'Insufficient quantity in stock' });
      return res.redirect("/login"); // Redirect if user is not logged in
    }
    if (!req.user || !req.user.userId) {
      return res.redirect("/login");
    }

    const userId = req.user.userId; // Get the user's ID from the decoded token
    const user = await User.findById(userId); // Use findById with the correct value

    if (!user) {
      return res.status(404).send("User not found"); // Handle user not found case
    }

    const product = await Product.findOne({ "id": id });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.quantity < quantity) {
      return res
        .status(400)
        .json({ message: "Insufficient quantity in stock" });
    }

    product.quantity -= quantity; // Decrease stock
    await product.save();

    let cart = user.cart;
    let existingItem = cart.find((item) => item.id == id);

    if (existingItem) {
      existingItem.quantity += quantity;
      existingItem.total_price = existingItem.price * existingItem.quantity;
    } else {
      const newCartItem = {
        id,
        name,
        price,
        image,
        quantity,
        total_price,
      };
      cart.push(newCartItem);
    }
    await user.save(); // Save the updated user
    res.status(200).json({ message: "Product added to cart" });
  } catch (error) {
    console.error("Error adding product to cart:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

const buyerRequestsJsonPath = path.join(__dirname, "../buyerrequests.json");

router.post("/notify", (req, res) => {
  const { productId, userId } = req.body;
  uId = req.user.userId;
  // Check for undefined or missing fields
  if (!productId) {
    console.error("Product ID is missing");
    return res.status(400).send("Product ID is required");
  }

  // Read existing requests
  fs.readFile(buyerRequestsJsonPath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading buyerrequests.json:", err);
      return res.status(500).send("Internal Server Error");
    }

    let buyerRequests = [];
    try {
      buyerRequests = JSON.parse(data);
    } catch (parseError) {
      console.error("Error parsing buyerrequests.json:", parseError);
      buyerRequests = []; // Default fallback
    }

    // Check if we're adding a valid request
    const newRequest = {
      productId,
      userId: uId, // Add a default if userId is missing
    };

    // Log the new request to check its contents
    console.log("Adding new request:", newRequest);

    // Add the new request to the list
    buyerRequests.push(newRequest);

    // Write the updated list of requests back to the file
    fs.writeFile(
      buyerRequestsJsonPath,
      JSON.stringify(buyerRequests, null, 2),
      "utf8",
      (writeErr) => {
        if (writeErr) {
          console.error("Error writing to buyerrequests.json:", writeErr);
          return res.status(500).send("Internal Server Error");
        }

        res.status(200).send("Notification request recorded");
      }
    );
  });
});

module.exports = router;

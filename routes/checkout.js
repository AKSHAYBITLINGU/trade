const express = require("express");
const router = express.Router();
const User = require("../models/user");
const PaymentService = require("../services/payment"); // Implement payment service

// Route to display cart and collect address
// router.get('/', async (req, res) => {
//     try {
//       if (!res.locals.isLoggedIn) {
//         return res.redirect("/login"); // Redirect if user is not logged in
//       }
//       if (!req.user || !req.user.userId) {
//         console.error("Error: req.user or req.user._id is undefined");
//         return res.redirect("/login");
//       }

//       const userId = req.user.userId;
//       const user = await User.findById(userId);

//       if (!user) {
//         return res.status(404).send("User not found");
//       }
//       const cartItems = user.cart;
//       let totalQuantity = 0;
//       let totalPrice = 0;

//       cartItems.forEach(item => {
//           totalQuantity += item.quantity;
//           totalPrice += item.quantity * item.price;
//       });

//       res.render('checkout', {
//           cartItems: cartItems,
//           user: user,
//           totalQuantity: totalQuantity,
//           totalPrice: totalPrice
//       });
//     } catch (error) {
//       console.error('Error displaying cart:', error);
//       res.status(500).send('Internal server error');
//     }
//   });

//   // Route to process payment
//   router.post('/checkout/pay', async (req, res) => {
//     try {
//       // Process payment using UPI option
//       const paymentResult = await PaymentService.processPayment(req.user.id, req.body.amount, req.body.upiOption);

//       if (paymentResult.success) {
//         // Create order
//         const order = new Order({
//           userId: req.user.id,
//           products: req.body.products,
//           address: req.body.address,
//           state: 'pending' // Set initial state
//         });
//         await order.save();

//         // Clear cart
//         await Cart.clearCart(req.user.id);

//         res.status(200).json({ message: 'Order placed successfully' });
//       } else {
//         res.status(400).json({ error: 'Payment failed' });
//       }
//     } catch (error) {
//       console.error('Error processing payment:', error);
//       res.status(500).json({ error: 'Internal server error' });
//     }
//   });

//   module.exports = router;

("use strict");

const validator = require("validator");

router.get("/", (req, res) => {
  res.redirect(301, "/checkout/info");
});

router.get("/info", async (req, res, next) => {
  try {
    if (!res.locals.isLoggedIn) {
      return res.redirect("/login");
    }
    if (!req.user || !req.user.userId) {
      console.error("Error: req.user or req.user._id is undefined");
      return res.redirect("/login");
    }

    const userId = req.user.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).send("User not found");
    }
    const cartItems = user.cart;
    let totalQuantity = 0;
    let totalPrice = 0;

    cartItems.forEach((item) => {
      totalQuantity += item.quantity;
      totalPrice += item.quantity * item.price;
    });

    res.render("checkoutinfo", {
      title: "Information",
      section: "Info",
      user: user,
      cartItems: cartItems,
      totalQuantity: totalQuantity,
      totalPrice: totalPrice,
    });
  } catch (error) {
    console.error("Error at Information:", error);
    res.status(500).send("Internal server error");
  }
});

router.get("/address", async (req, res, next) => {
  try {
    if (!res.locals.isLoggedIn) {
      return res.redirect("/login");
    }
    if (!req.user || !req.user.userId) {
      console.error("Error: req.user or req.user._id is undefined");
      return res.redirect("/login");
    }

    const userId = req.user.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).send("User not found");
    }

    res.render("checkoutbilling-shipping", {
      title: "Billing and shipping",
      section: "billing",
      user: user,
    });
  } catch (error) {
    console.error("Error at billing-shipping:", error);
    res.status(500).send("Internal server error");
  }
});

router.get("/payment", async (req, res, next) => {
  try {
    if (!res.locals.isLoggedIn) {
      return res.redirect("/login");
    }
    if (!req.user || !req.user.userId) {
      console.error("Error: req.user or req.user._id is undefined");
      return res.redirect("/login");
    }

    const userId = req.user.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).send("User not found");
    }

    res.render("checkoutpayment", {
      title: "Payment",
      section: "payment",
      user: user,
    });
  } catch (error) {
    console.error("Error at billing-shipping:", error);
    res.status(500).send("Internal server error");
  }
});

router.get("/thankyou", async (req, res, next) => {
  try {
    if (!res.locals.isLoggedIn) {
      return res.redirect("/login");
    }
    if (!req.user || !req.user.userId) {
      console.error("Error: req.user or req.user._id is undefined");
      return res.redirect("/login");
    }

    const userId = req.user.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).send("User not found");
    }
    const cartItems = user.cart;
    let totalQuantity = 0;
    let totalPrice = 0;

    cartItems.forEach((item) => {
      totalQuantity += item.quantity;
      totalPrice += item.quantity * item.price;
    });

    res.render("checkoutthankyou", {
      title: "Order Complete",
      section: "thank-you",
      user: user,
      orderItems: cartItems,
      totalQuantity: totalQuantity,
      totalPrice: totalPrice,
    });
  } catch (error) {
    console.error("Error at Information:", error);
    res.status(500).send("Internal server error");
  }
});

// router.post('/billing-shipping', (req, res, next) => {
//     const post = req.body;
//     const errors = [];

//     if(validator.isEmpty(post.billing_full_name)) {
//         errors.push({
//             param: 'billing_first_name',
//             msg: 'Required field.'
//         });
//     }
//     if(!validator.isEmail(post.billing_email)) {
//         errors.push({
//             param: 'billing_email',
//             msg: 'Invalid e-mail address.'
//         });
//     }

//     if(validator.isEmpty(post.billing_address)) {
//         errors.push({
//             param: 'billing_address',
//             msg: 'Required field.'
//         });
//     }

//     if(!post.same_as) {
//         if(validator.isEmpty(post.shipping_full_name)) {
//             errors.push({
//                 param: 'shipping_first_name',
//                 msg: 'Required field.'
//             });
//         }

//         if(!validator.isEmail(post.shipping_email)) {
//             errors.push({
//                 param: 'shipping_email',
//                 msg: 'Invalid e-mail address.'
//             });
//         }

//         if(validator.isEmpty(post.shipping_address)) {
//             errors.push({
//                 param: 'shipping_address',
//                 msg: 'Required field.'
//             });
//         }

//     if(errors.length > 0) {
//         res.json({ errors });
//     } else {
//         const billing = {};

//         for(let prop in post) {
//             if(prop.startsWith('billing')) {
//                 let key = prop.replace('billing', '').replace(/_/g, '');
//                 billing[key] = post[prop];
//             }
//         }

//         req.session.user.billing = billing;

//         if(!post.same_as) {
//             const shipping = {};

//             for(let prop in post) {
//                 if(prop.startsWith('shipping')) {
//                     let key = prop.replace('shipping', '').replace(/_/g, '');
//                     shipping[key] = post[prop];
//                 }
//             }

//             req.session.user.shipping = shipping;
//         }

//         res.json({ saved: true });
//     }
// });

// router.post('/login', (req, res, next) => {
//     const { email, password } = req.body;
//     const errors = [];

//     if(!validator.isEmail(email)) {
//         errors.push({
//             param: 'email',
//             msg: 'Invalid e-mail address.'
//         });
//     }

//     if(validator.isEmpty(password)) {
//         errors.push({
//             param: 'password',
//             msg: 'Invalid password.'
//         });
//     }

//     if(errors.length) {
//         res.json({ errors });
//     } else {
//         if(!req.session.user) {
//             req.session.user = { email };
//         }
//         res.json({ loggedIn: true });
//     }
// });

// router.post('/register', (req, res, next) => {
//     const { name, email, password } = req.body;
//     const errors = [];

//     if(validator.isEmpty(name)) {
//         errors.push({
//             param: 'name',
//             msg: 'Invalid name.'
//         });
//     }

//     if(!validator.isEmail(email)) {
//         errors.push({
//             param: 'email',
//             msg: 'Invalid e-mail address.'
//         });
//     }

//     if(validator.isEmpty(password)) {
//         errors.push({
//             param: 'password',
//             msg: 'Invalid password.'
//         });
//     }

//     if(errors.length) {
//         res.json({ errors });
//     } else {
//         if(!req.session.user) {
//             req.session.user = { name, email };
//         }
//         res.json({ registered: true });
//     }
// });

module.exports = router;

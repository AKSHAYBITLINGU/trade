const express = require('express');
const router = express.Router();
const PaymentService = require('../services/payment'); // Implement payment service

// Route to display cart and collect address
router.get('/', async (req, res) => {
  try {
    const cart = await Cart.getCart(req.user.id);
    res.render('checkout', { cart, user: req.user });
  } catch (error) {
    console.error('Error displaying cart:', error);
    res.status(500).send('Internal server error');
  }
});

// Route to process payment
router.post('/checkout/pay', async (req, res) => {
  try {
    // Process payment using UPI option
    const paymentResult = await PaymentService.processPayment(req.user.id, req.body.amount, req.body.upiOption);

    if (paymentResult.success) {
      // Create order
      const order = new Order({
        userId: req.user.id,
        products: req.body.products,
        address: req.body.address,
        state: 'pending' // Set initial state
      });
      await order.save();

      // Clear cart
      await Cart.clearCart(req.user.id);

      res.status(200).json({ message: 'Order placed successfully' });
    } else {
      res.status(400).json({ error: 'Payment failed' });
    }
  } catch (error) {
    console.error('Error processing payment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

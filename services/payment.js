// Mock payment service for simulating UPI payments
const PaymentService = {
    // Simulates processing a payment
    processPayment: async (userId, amount, upiOption) => {
      try {
        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 2000));
  
        // Simulate success or failure randomly
        const success = Math.random() < 0.8; // 80% success rate
  
        if (success) {
          return { success: true, message: 'Payment successful' };
        } else {
          return { success: false, message: 'Payment failed' };
        }
      } catch (error) {
        console.error('Error processing payment:', error);
        return { success: false, message: 'Payment failed' };
      }
    }
  };
  
  module.exports = PaymentService;
  
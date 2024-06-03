const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const cartItemSchema = new mongoose.Schema({
    id: { type:Number,unique:true, required: true }, // ObjectId to reference the Product
    name: { type: String, required: true }, // Product name
    image: { type: String, required: true }, // Image URL
    price: { type: Number, required: true }, // Price per unit
    quantity: { type: Number, required: true }, // Quantity in the cart
    total_price: { type: Number, required: true }, // Total price for the quantity
  }, { _id: false }); // Disable automatic _id generation for embedded documents

const userSchema = new mongoose.Schema(
  {
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    phone: { type: String, required: true,unique: true},
    email: { type: String, unique: true, required: false },
    address: { type: String, required: false },
    gender: { type: String, enum: ['male', 'female', 'other'], required: false },
    profilePic: { data: Buffer, contentType: String },
    cart: {
      type: [cartItemSchema],
      default: [], // Ensures cart is initialized
    },
    myorders: {
      type: [cartItemSchema],
      default: [], // Ensures cart is initialized
    },
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt fields
);

// Method to compare the provided password with the hashed password
userSchema.methods.comparePassword = async function (password) {
  try {
    // Return the result of the password comparison
    return await bcrypt.compare(password, this.password);
  } catch (err) {
    // Throw an error if comparison fails
    throw new Error('Error comparing passwords');
  }
};

// Create the User model with the defined schema
const User = mongoose.model('User', userSchema);

// Export the User model for use in other modules
module.exports = User;

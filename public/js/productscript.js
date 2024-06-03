function handleAddToCart(button) {
  const productId = button.getAttribute("data-product-id");
  const productName = button.getAttribute("data-product-name");
  const productImage = button.getAttribute("data-product-image");
  const productPrice = parseFloat(button.getAttribute("data-product-price"));
  const productQuantity = parseInt(
    button.getAttribute("data-product-quantity"),
    10
  );

  openModal(
    productId,
    productName,
    productImage,
    productPrice,
    productQuantity
  );
}

function openModal(
  productId,
  productName,
  productImage,
  productPrice,
  productQuantity
) {
  const modal = document.getElementById("product-modal");
  modal.style.display = "block"; // Show the modal

  // Set product details in the modal
  document.getElementById("product-id").value = productId;
  document.getElementById("product-name").textContent = productName;
  document.getElementById("product-image").src = `${productImage}`;
  document.getElementById("product-price").textContent =
    productPrice.toFixed(2);

  // Set initial total price based on default quantity
  const quantity = parseInt(document.getElementById("quantity").value, 10);
  const totalPrice = productPrice * quantity;
  document.getElementById("total-price").textContent = totalPrice.toFixed(2);
}

function closeModal() {
  const modal = document.getElementById("product-modal");
  modal.style.display = "none"; // Hide the modal
  // Reloads the current page
  window.location.reload();
}

function updateTotal() {
  const quantity = parseInt(document.getElementById("quantity").value, 10);
  const productPrice = parseFloat(
    document.getElementById("product-price").textContent
  );
  const totalPrice = productPrice * quantity;
  document.getElementById("total-price").textContent = totalPrice.toFixed(2);
}
//   function addToCart() {
//     var button = document.querySelector('#product-modal button');
//     button.textContent = 'Added To Cart';
//     button.style.backgroundColor = 'green';

//     const productId = document.getElementById('product-id').value;
//     const productName = document.getElementById('product-name').textContent;
//     const productImage = document.getElementById('product-image').src;
//     const productPrice = parseFloat(document.getElementById('product-price').textContent);
//     const quantity = parseInt(document.getElementById('quantity').value, 10);
//     const totalPrice = productPrice * quantity;

//     // AJAX request to add the product to cart.json
//     fetch('/cart/add', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         id:productId,
//         name: productName,
//         price: productPrice,
//         image: productImage,
//         quantity: quantity,
//         total_price: totalPrice,
//       }),
//     })
//       .then(response => {
//         if (response.ok) {
//           console.log('Product added to cart.');
//         } else {
//           console.error('Failed to add product to cart.');
//         }
//       })
//       .catch(error => {
//         console.error('Error adding product to cart:', error);
//       });
//   }
function addToCart() {
  const button = document.querySelector("#product-modal button:first-of-type");
  button.disabled = true;

  const productId = document.getElementById("product-id").value;
  const productName = document.getElementById("product-name").textContent;
  const productImage = document.getElementById("product-image").src;
  const productPrice = parseFloat(
    document.getElementById("product-price").textContent
  );
  const quantity = parseInt(document.getElementById("quantity").value, 10);
  const totalPrice = productPrice * quantity;

  // AJAX request to add the product to cart
  fetch("/cart/add", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: productId,
      name: productName,
      image: productImage,
      price: productPrice,
      quantity: quantity,
      total_price: totalPrice,
    }),
  })
    .then((response) => {
      if (response.ok) {
        console.log("Product added to cart.");
        button.textContent = "Added to Cart";
        button.style.backgroundColor = "green";
      } else {
        console.error("Failed to add product to cart.");
        button.textContent = "Add to Cart";
        button.style.backgroundColor = "red";
        if (response.status === 400) {
          alert(
            "Unable to add product to cart. Please check stock or try again later."
          );
        }
      }
    })
    .catch((error) => {
      console.error("Error adding product to cart:", error);
      alert(
        "An error occurred while adding the product to the cart. Please try again."
      );
      button.textContent = "Add to Cart";
      button.style.backgroundColor = "red";
    })
    .finally(() => {
      button.disabled = false;
    });
}

function GoToCart() {
  // Navigate to the cart page
  window.location.href = "/cart";
}

function GoToLogin() {
  // Navigate to the cart page
  window.location.href = "/login";
}

function notifyWhenAvailable(button) {
  const productId = button.getAttribute("data-product-id");

  fetch("/cart/notify", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      productId: productId,
      userId: "currentUserId", // Adjust to identify the user, if needed
    }),
  })
    .then((response) => {
      if (response.ok) {
        // Update the button to indicate the user will be notified
        button.textContent = "You Will Be Notified";
        button.style.backgroundColor = "green"; // Change color to green
        button.style.color = "white"; // Optional: Set text color for visibility
        button.disabled = true; // Prevent further clicks
      } else {
        console.error("Failed to record notification request.");
      }
    })
    .catch((error) => {
      console.error("Error recording notification request:", error);
    });
}

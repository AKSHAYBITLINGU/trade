document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".remove-item").forEach((button) => {
    button.addEventListener("click", handleRemoveClick);
  });
  document.querySelectorAll(".edit-item").forEach((button) => {
    button.addEventListener("click", handleEditClick);
  });
});

let x = document.querySelector(".cart-total-quantity");
let y = document.querySelector(".cart-total-price");
console.log(x, y);

function handleRemoveClick(event) {
  const itemId = event.target.id;
  hideCartItem(itemId);
  deleteItemFromDatabase(itemId);
}

function hideCartItem(itemId) {
  const itemElement = document.querySelector(`[id="_${itemId}"]`);
  if (itemElement) {
    const cartItemElement = itemElement.closest(".cart-item");

    let cartTotalQuantityElement = document.querySelector(
      ".cart-total-quantity"
    );
    let cartTotalPriceElement = document.querySelector(".cart-total-price");
    const itemDetails = itemElement.querySelector(".cart-item-details");
    const currentQuantityElement = itemDetails.querySelector(".item-quantity");
    const currentSubTotalElement = itemDetails.querySelector(".item-subtotal");

    const subtotal = parseFloat(currentSubTotalElement.textContent);
    const carttotal = parseFloat(cartTotalPriceElement.innerText);
    const subquantity = parseFloat(currentQuantityElement.textContent);
    const cartquantity = parseFloat(cartTotalQuantityElement.innerText);
    const newtotalprice = carttotal - subtotal;
    const newTotalQuantity = cartquantity - subquantity;

    cartTotalQuantityElement.innerText = newTotalQuantity.toString();
    cartTotalPriceElement.innerText = newtotalprice.toString();

    if (cartItemElement) {
      cartItemElement.style.display = "none";
    } else {
      console.error("Cart item container not found.");
    }
  } else {
    console.error("Item element not found.");
  }
}

async function deleteItemFromDatabase(itemId) {
  try {
    const response = await fetch(`/cart/delete-item/${itemId}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    console.log("Item removed successfully.");
  } catch (error) {
    console.error("Error removing item:", error);
  }
}

document.querySelectorAll(".edit-item").forEach((button) => {
  button.addEventListener("click", handleEditClick);
});

document.querySelectorAll(".update-item").forEach((button) => {
  button.addEventListener("click", handleUpdateClick);
});

function handleEditClick(event) {
  const itemId = event.target.id.replace("edit_", "");
  const editButton = event.target;
  const editControls = document.querySelector(`#edit-controls_${itemId}`);

  if (editButton.textContent === "Edit") {
    editButton.textContent = "Cancel";
    editControls.style.display = "block";
  } else {
    editButton.textContent = "Edit";
    editControls.style.display = "none";
  }
}

async function handleUpdateClick(event) {
  const itemId = event.target.id.replace("update_", "");
  const editControls = document.querySelector(`#edit-controls_${itemId}`);
  const inputField = editControls.querySelector(".quantity-input");
  const newQuantity = inputField.value;

  try {
    const response = await fetch(`/cart/update-item/${itemId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity: newQuantity }),
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    console.log("Item quantity updated successfully.");

    const itemElement = document.querySelector(`#_${itemId}`);
    const itemDetails = itemElement.querySelector(".cart-item-details");
    const currentQuantityElement = itemDetails.querySelector(".item-quantity");
    const currentPriceElement = itemDetails.querySelector(".item-price");
    const currentSubTotalElement = itemDetails.querySelector(".item-subtotal");

    var currentprevQuantity = currentQuantityElement.innerText.match(/\d+/)[0];
    currentprevQuantity = parseFloat(currentprevQuantity, 10);

    var currentprevPrice = currentSubTotalElement.innerText.match(/\d+/)[0];
    currentprevPrice = parseFloat(currentprevPrice, 10);

    currentQuantityElement.textContent = `Quantity: ${newQuantity}`;
    const price = parseFloat(currentPriceElement.textContent.split(": ")[1]);
    const subtotal = (price * newQuantity).toFixed(2);
    currentSubTotalElement.textContent = `Subtotal: ${subtotal}`;

    let cartTotalQuantityElement = document.querySelector(
      ".cart-total-quantity"
    );
    let cartTotalPriceElement = document.querySelector(".cart-total-price");
    const carttotal = parseFloat(cartTotalPriceElement.innerText);
    const cartquantity = parseFloat(cartTotalQuantityElement.innerText);
    const newtotalprice = carttotal - currentprevPrice + parseFloat(subtotal);
    const newTotalQuantity =
      cartquantity - currentprevQuantity + parseFloat(newQuantity);

    cartTotalQuantityElement.innerText = newTotalQuantity.toString();
    cartTotalPriceElement.innerText = newtotalprice.toString();

    const editButton = document.querySelector(`#edit_${itemId}`);
    editButton.textContent = "Edit";
    editButton.classList.remove("cancel-mode");
    editControls.style.display = "none";
  } catch (error) {
    console.error("Error updating item quantity:", error);
  }
}

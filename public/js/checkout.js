document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("billing-shipping-form");
  const sameAsCheckbox = document.getElementById("same-as");

  sameAsCheckbox.addEventListener("change", () => {
    const billingFields = form.querySelectorAll('[name^="billing_"]');
    const shippingFields = form.querySelectorAll('[name^="shipping_"]');

    if (sameAsCheckbox.checked) {
      shippingFields.forEach((field, index) => {
        field.value = billingFields[index].value;
        field.disabled = true;
      });
    } else {
      shippingFields.forEach((field) => {
        field.value = "";
        field.disabled = false;
      });
    }
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault(); // Prevent the form from submitting normally

    const formData = new FormData(form);
    const data = {};
    formData.forEach((value, key) => {
      data[key] = value;
    });

    fetch("/billing-shipping", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((result) => {
        if (result.errors) {
          // Clear previous error messages
          document
            .querySelectorAll(".error-message")
            .forEach((el) => el.remove());

          // Display new error messages
          result.errors.forEach((error) => {
            const field = document.getElementById(error.param);
            if (field) {
              const errorMessage = document.createElement("p");
              errorMessage.className = "error-message";
              errorMessage.textContent = error.msg;
              field.parentElement.appendChild(errorMessage);
            }
          });
        } else if (result.saved) {
          // Handle successful form submission
          alert("Information saved successfully!");
          form.reset(); // Optionally reset the form
        }
      });
  });
});

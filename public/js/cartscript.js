const axios = require("axios");
document.addEventListener("DOMContentLoaded", function () {
  var RemoveItemButton = document.getElementById("remove-item");
  if (RemoveItemButton) {
    RemoveItemButton.addEventListener("click", function () {
      RemoveItem();
    });
  }
});

function RemoveItem() {}

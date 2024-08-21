document.addEventListener("DOMContentLoaded", () => {
  const categorySelect = document.getElementById("category");
  const videoItems = document.querySelectorAll(".video-item");

  categorySelect.addEventListener("change", function () {
    const selectedCategory = this.value;

    videoItems.forEach((item) => {
      const itemCategory = item.getAttribute("data-category");
      if (selectedCategory === "" || itemCategory === selectedCategory) {
        item.style.display = "block";
      } else {
        item.style.display = "none";
      }
    });
  });
});

function getVideoId(url) {
  const regex =
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

function getThumbnail() {
  const url = document.getElementById("videoUrl").value;
  const videoId = getVideoId(url);
  if (videoId) {
    const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    document.getElementById("thumbnailContainer").innerHTML = `
          <img src="${thumbnailUrl}" alt="YouTube Thumbnail">
      `;
  } else {
    document.getElementById("thumbnailContainer").innerHTML = "Invalid URL";
  }
}

async function collectDataFromAPI() {
  try {
    const response = await fetch("/api/data");
    if (!response.ok) {
      console.error("Response status:", response.status);
      console.error("Response status text:", response.statusText);
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    const { categories, subcategories, products } = data;
    return { categories, subcategories, products };
  } catch (error) {
    console.error("Error collecting data from API:", error);
    return [];
  }
}

const resultsBox = document.querySelector(".result-box");
const inputBox = document.getElementById("input-box");

async function initialize() {
  const { categories, subcategories, products } = await collectDataFromAPI();
  const data = categories.concat(subcategories, products);
  inputBox.onkeyup = function () {
    let result = [];
    let input = inputBox.value;
    if (input.length) {
      result = data.filter((keyword) => {
        return keyword.toLowerCase().includes(input.toLowerCase());
      });
    }
    display(result);
    if (!result.length) {
      resultsBox.innerHTML = "";
      resultsBox.style.display = "none";
    } else {
      resultsBox.style.display = "block";
    }
  };
}

initialize();
async function display(result) {
  const { categories, subcategories, products } = await collectDataFromAPI();
  const content = result.map((item) => {
    let label = "";
    if (categories.includes(item)) {
      label = "Category";
    } else if (subcategories.includes(item)) {
      label = "Subcategory";
    } else if (products.includes(item)) {
      label = "Product";
    } else {
      label = "NO LABEL";
    }
    return `<li onclick="selectInput(this)" style="display: flex">${item}<span class="label">${label}</span></li>`;
  });
  resultsBox.innerHTML = `<ul>${content.join("")}</ul>`;
}

function selectInput(list) {
  const labelSpan = list.querySelector(".label");
  let text = list.textContent;
  if (labelSpan) {
    const labelText = labelSpan.textContent;
    text = text.replace(labelText, "").trim();
  }

  inputBox.value = text;
  resultsBox.innerHTML = "";
}

const searchButton = document.getElementById("searchbutton");

searchButton.addEventListener("click", async function () {
  const { categories, subcategories, products } = await collectDataFromAPI();
  const inputValue = inputBox.value.trim();

  if (categories.includes(inputValue)) {
    window.location.href = `/c/${inputValue}`;
  } else if (subcategories.includes(inputValue)) {
    const parentCategory = await getParentCategory(inputValue);
    if (parentCategory) {
      window.location.href = `/c/${parentCategory}/${inputValue}`;
    } else {
      console.log("Subcategory not found or not associated with a category.");
    }
  } else if (products.includes(inputValue)) {
    const parentSubCategory = await getParentSubCategory(inputValue);
    const parentCategory = await getParentCategory(parentSubCategory);
    if (parentSubCategory && parentCategory) {
      window.location.href = `/c/${parentCategory}/${parentSubCategory}/#${inputValue}`;
    } else {
      console.log("Product not found or not associated with a subcategory.");
    }
  }
});

async function getParentCategory(subcategoryName) {
  try {
    const response = await fetch(`/api/category/${subcategoryName}`);
    if (!response.ok) {
      throw new Error("Failed to fetch parent category");
    }
    const data = await response.json();
    return data.parentCategory;
  } catch (error) {
    console.error("Error fetching parent category:", error);
    return null;
  }
}

async function getParentSubCategory(productName) {
  try {
    const response = await fetch(`/api/subcategory/${productName}`);
    if (!response.ok) {
      throw new Error("Failed to fetch parent subcategory");
    }
    const data = await response.json();
    return data.parentSubCategory;
  } catch (error) {
    console.error("Error fetching parent subcategory:", error);
    return null;
  }
}

const menuBtn = document.querySelector(".menu-icon span");
const searchBtn = document.querySelector(".search-icon");
const cancelBtn = document.querySelector(".cancel-icon");
const items = document.querySelector(".nav-items");
const form = document.querySelector(".search-box");
menuBtn.onclick = () => {
  items.classList.add("active");
  menuBtn.classList.add("hide");
  searchBtn.classList.add("hide");
  cancelBtn.classList.add("show");
  form.classList.remove("active");
};
cancelBtn.onclick = () => {
  items.classList.remove("active");
  menuBtn.classList.remove("hide");
  searchBtn.classList.remove("hide");
  cancelBtn.classList.remove("show");
  form.classList.remove("active");
  cancelBtn.style.color = "#ff3d00";
};
searchBtn.onclick = () => {
  form.classList.add("active");
  searchBtn.classList.add("hide");
  cancelBtn.classList.add("show");
};

document.addEventListener("DOMContentLoaded", async () => {
  const videoList = document.getElementById("video-list");
  const sortSelect = document.getElementById("sort");
  const filterSelect = document.getElementById("filter");
  const searchInput = document.getElementById("search");

  let videos = [];

  const fetchVideos = async () => {
    try {
      const response = await fetch("/api/videos");
      videos = await response.json();
      sortFilterAndSearchVideos();
    } catch (err) {
      console.error("Failed to fetch videos:", err);
    }
  };

  const renderVideos = (videosToRender) => {
    videoList.innerHTML = "";
    videosToRender.forEach((video) => {
      const li = document.createElement("li");
      li.innerHTML = `<a href="${video.link}" target="_blank">${video.title}</a>`;
      videoList.appendChild(li);
    });
  };

  const sortFilterAndSearchVideos = () => {
    const sortCriteria = sortSelect.value;
    const filterCriteria = filterSelect.value;
    const searchCriteria = searchInput.value.toLowerCase();

    let filteredVideos = videos;

    if (filterCriteria !== "all") {
      filteredVideos = videos.filter(
        (video) => video.category === filterCriteria
      );
    }

    if (searchCriteria) {
      filteredVideos = filteredVideos.filter((video) =>
        video.title.toLowerCase().includes(searchCriteria)
      );
    }

    const sortedVideos = filteredVideos.sort((a, b) => {
      if (sortCriteria === "title") {
        return a.title.localeCompare(b.title);
      } else if (sortCriteria === "date") {
        return new Date(a.date) - new Date(b.date);
      }
    });

    renderVideos(sortedVideos);
  };

  sortSelect.addEventListener("change", sortFilterAndSearchVideos);
  filterSelect.addEventListener("change", sortFilterAndSearchVideos);
  searchInput.addEventListener("input", sortFilterAndSearchVideos);

  // Initial fetch and render
  await fetchVideos();
});

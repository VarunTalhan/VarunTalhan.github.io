window.onload = function () {
  // Keep the loading screen visible for 3 seconds
  setTimeout(function () {
    // Hide the loading screen
    document.getElementById("first-content").style.display = "none";

    // Show the main content
    document.getElementById("main-content").style.display = "block";
  }, 1000); // 3000 milliseconds = 3 seconds
};

document.addEventListener("DOMContentLoaded", function () {
  // Add 'loaded' class to body after content is fully loaded
  document.body.classList.remove("loading");
  document.body.classList.add("loaded");
});

// Add 'loading' class to body initially
document.body.classList.add("loading");

const swiper = new Swiper(".swiper", {
  loop: true,

  // If we need pagination
  pagination: {
    el: ".swiper-pagination",
  },

  // Navigation arrows
  navigation: {
    nextEl: ".swiper-button-next",
    prevEl: ".swiper-button-prev",
  },
});

var typingEffect = new Typed(".multiText", {
  strings: [
    "Money looks good in digits rather than fidgets",
    "Start your career with us",
    "Just one click away!",
  ],
  loop: true,
  typeSpeed: 100,
  backSoeed: 80,
  startDelay: 1000,
  backDelay: 1500,
});

let next = document.querySelector(".next");
let prev = document.querySelector(".prev");

next.addEventListener("click", function () {
  let items = document.querySelectorAll(".item");
  document.querySelector(".slide").appendChild(items[0]);
});

prev.addEventListener("click", function () {
  let items = document.querySelectorAll(".item");
  document.querySelector(".slide").prepend(items[items.length - 1]); // here the length of items = 6
});

const items = document.querySelectorAll(".accordion button");

function toggleAccordion() {
  const itemToggle = this.getAttribute("aria-expanded");

  for (i = 0; i < items.length; i++) {
    items[i].setAttribute("aria-expanded", "false");
  }

  if (itemToggle == "false") {
    this.setAttribute("aria-expanded", "true");
  }
}

items.forEach((item) => item.addEventListener("click", toggleAccordion));

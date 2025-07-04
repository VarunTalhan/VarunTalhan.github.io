var titles = document.querySelectorAll(".service_Title");
var serviceDescriptions = document.querySelectorAll(".service_description");
var icons = document.querySelectorAll(".ri-add-fill");
var headings = document.querySelectorAll(".service_Title h2");

titles.forEach((title, index) => {
  title.addEventListener("click", () => {
    var isActive = serviceDescriptions[index].classList.contains("ActiveDesc");

    serviceDescriptions.forEach((desc) => {
      desc.classList.remove("ActiveDesc");
    });
    icons.forEach((icon) => {
      icon.classList.remove("ri-subtract-line");
    });
    headings.forEach((heading) => {
      heading.classList.remove("ActiveHeading");
    });

    if (!isActive) {
      serviceDescriptions[index].classList.add("ActiveDesc");
      icons[index].classList.add("ri-subtract-line");
      headings[index].classList.add("ActiveHeading");
    }
  });
});

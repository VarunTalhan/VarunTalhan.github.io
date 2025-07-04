const btns = document.querySelectorAll(".acc-btn");

function accordion() {
  this.classList.toggle("is-open");

  // the acc-content
  const content = this.nextElementSibling;

  if (content.style.maxHeight) content.style.maxHeight = null;
  else content.style.maxHeight = content.scrollHeight + "px";
}

btns.forEach((el) => el.addEventListener("click", accordion));

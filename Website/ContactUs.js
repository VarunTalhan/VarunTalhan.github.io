document
  .querySelector(".contactForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const nameInput = document.querySelector('input[placeholder="your name"]');
    const emailInput = document.querySelector(
      'input[placeholder="your email"]'
    );
    const subjectInput = document.querySelector(
      'input[placeholder="your Subject"]'
    );
    const messageInput = document.querySelector(
      'textarea[placeholder="Your message..."]'
    );
    const formMessage = document.getElementById("formMessage");

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const subject = subjectInput.value.trim();
    const message = messageInput.value.trim();

    // Reset styles and messages
    formMessage.style.display = "none";
    nameInput.style.borderColor = "";
    emailInput.style.borderColor = "";
    subjectInput.style.borderColor = "";
    messageInput.style.borderColor = "";

    if (!name) {
      nameInput.style.borderColor = "red";
      formMessage.textContent = "Please enter your name.";
      formMessage.style.color = "red";
      formMessage.style.display = "block";
      return;
    }

    if (!email.includes("@") || !email.includes(".")) {
      emailInput.style.borderColor = "red";
      formMessage.textContent = "Email must contain '@' and a domain.";
      formMessage.style.color = "red";
      formMessage.style.display = "block";
      return;
    }

    if (!subject) {
      subjectInput.style.borderColor = "red";
      formMessage.textContent = "Please enter a subject.";
      formMessage.style.color = "red";
      formMessage.style.display = "block";
      return;
    }

    if (!message) {
      messageInput.style.borderColor = "red";
      formMessage.textContent = "Please enter a message.";
      formMessage.style.color = "red";
      formMessage.style.display = "block";
      return;
    }

    // Success message
    formMessage.style.color = "green";
    formMessage.textContent = "Message sent!";
    formMessage.style.display = "block";

    // Reset the form
    document.querySelector(".contactForm").reset();
  });

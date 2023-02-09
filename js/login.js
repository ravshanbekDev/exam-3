const register = document.querySelector("#register");
const username = document.querySelector("#usernameSignup");
const password = document.querySelector("#passwordSignup");

// Login
const login = document.querySelector("#login");
const nameInput = document.querySelector("#signInName");
const passwordInput = document.querySelector("#signInPassword");

const users = JSON.parse(localStorage.getItem("users")) || [];

login.addEventListener("submit", (event) => {
  event.preventDefault();
  fetch(`https://todo-for-n92.cyclic.app/user/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: nameInput.value,
      password: passwordInput.value,
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      console.log(data);
      if (data.message === "Auth failed, User was not found!") {
        users.forEach((item) => {
          if (item.name === nameInput.value) {
            localStorage.setItem("token", JSON.stringify(item.token));
            window.location.replace("index.html");
          } else {
            console.log("No token available");
          }
        });
      }
    })
    .catch((error) => console.log("error"));
});

// Register
register.addEventListener("submit", (event) => {
  event.preventDefault();

  // User object
  const user = {
    name: username.value,
    password: password.value,
    token: null,
  };

  // Request body object
  const body = {
    username: username.value,
    password: password.value,
  };

  fetch("https://todo-for-n92.cyclic.app/user/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      if (data) {
        user.token = data.token;
        users.push(user);
        localStorage.setItem("users", JSON.stringify(users));
        localStorage.setItem("token", JSON.stringify(data.token));
        window.location.replace("index.html");
      } else {
        console.log("null");
      }
    })
    .catch((error) => {
      console.log("API not found");
    });

  username.value = "";
  password.value = "";
});

//*********
const forms = document.querySelector(".forms"),
  pwShowHide = document.querySelectorAll(".eye-icon"),
  links = document.querySelectorAll(".link");

pwShowHide.forEach((eyeIcon) => {
  eyeIcon.addEventListener("click", () => {
    let pwFields =
      eyeIcon.parentElement.parentElement.querySelectorAll(".password");

    pwFields.forEach((password) => {
      if (password.type === "password") {
        password.type = "text";
        eyeIcon.classList.replace("bx-hide", "bx-show");
        return;
      }
      password.type = "password";
      eyeIcon.classList.replace("bx-show", "bx-hide");
    });
  });
});

links.forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault(); //preventing form submit
    forms.classList.toggle("show-signup");
  });
});

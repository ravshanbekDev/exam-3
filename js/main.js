// const token = localStorage.getItem("token");
let token = localStorage.getItem("token") || "";

const logout = document.querySelector("#logout");

if (!token) {
  window.location.replace("login.html");
}

logout.addEventListener("click", () => {
  localStorage.removeItem("token");
  window.location.replace("login.html");
});

const todoForm = document.querySelector("#todoForm");
const cards = document.querySelector("#cards");
const todoTogglers = document.querySelectorAll("todoRadio");
let todosArr = JSON.parse(localStorage.getItem("todo")) || [];
render();

todoForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const todoCaption = event.target[0].value;

  const todo = {
    id: todosArr[todosArr.length - 1]?.id + 1 || 0,
    task: todoCaption,
    isCompleted: false,
    isEditing: false,
  };

  fetch("https://todo-for-n92.cyclic.app/todos/add", {
    method: "POST",
    headers: {
      "x-access-token": token,
    },
    body: JSON.stringify({
      task: todo.task,
    }),
  }).then((response) => {
    if (response.ok) {
      console.log(response);
    }
  });

  todosArr.push(todo);
  render();
  event.target[0].value = "";
  console.log(todosArr);
});

async function getTodo(id) {
  const response = await fetch(`https://todo-for-n92.cyclic.app/todos/${id}`, {
    headers: {
      "x-access-token": token,
    },
  });
  console.log(response);
}

async function render() {
  const res = await fetch(`https://todo-for-n92.cyclic.app/todos/all`, {
    method: "GET",
    headers: {
      "x-access-token": token,
    },
  });
  console.log(res);
  cards.innerHTML = "";
  for (let i = 0; i < todosArr.length; i++) {
    const todo = todosArr[i];
    const template = todo.isEditing
      ? `
    <form class="col-md-3 p-3 rounded bg-light" id="editForm" onsubmit="return editTodo(event, ${todo.id})">
      <input type="text" value="${todo.task}" class="w-100"> 
      <div class="d-flex justify-content-end pt-3">
        <button class="btn btn-warning" type="submit" id="save">
          <i class="fas fa-floppy-disk"></i>
        </button>
      </div>
    </form>`
      : `
    <div class="col-md-3 p-3 ${
      todo.isCompleted ? "bg-success text-light" : "bg-light"
    } rounded">
      <div class="form-check form-switch">
        <input class="form-check-input" type="checkbox" role="switch" id="todoRadio-${
          todo.id
        }" onchange="toggleCompleted(${todo.id})" ${
          todo.isCompleted ? "checked" : ""
        }>
        <label class="form-check-label" for="todoRadio-${todo.id}">
          ${todo.task}
        </label>
        <div class="d-flex justify-content-end gap-3 mt-3">
          <button class="btn btn-warning" type="button" id="edit_btn" data-id="${
            todo.id
          }" onclick="toggleEditing(${todo.id})">
            <i class="fas fa-pen"></i>
          </button>
          <button class="btn btn-danger" type="submit" id="delete_btn" onclick="deleteTodo(${
            todo.id
          })">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    </div>
  `;

    cards.innerHTML += template;
  }
  localStorage.setItem("todo", JSON.stringify(todosArr));
}

async function toggleCompleted(id) {
  const checkbox = document.querySelector(`#todoRadio-${id}`);
  const completed = checkbox.checked;

  try {
    const res = await fetch(`https://todo-for-n92.cyclic.app/todos/${id}`, {
      method: "PUT",
      headers: { "x-access-token": token },
      body: JSON.stringify({ completed }),
    });

    if (res.status === 200) {
      for (let i = 0; i < todosArr.length; i++) {
        const todo = todosArr[i];
        if (todo.id === id) {
          todo.isCompleted = completed;
          localStorage.setItem("todo", JSON.stringify(todosArr));
        }
      }
      render();
    } else {
      throw new Error(res.statusText);
    }
  } catch (error) {
    console.error(error);
  }
}

async function toggleEditing(id) {
  const res = await fetch(`https://todo-for-n92.cyclic.app/todos/${id}`, {
    method: "PUT",
    headers: {
      "x-access-token": token,
    },
    body: JSON.stringify({ isEditing: true }),
  });
  console.log(res);
  if (res.status === 200) {
    for (let i = 0; i < todosArr.length; i++) {
      const todo = todosArr[i];
      if (todo.id === id) {
        todo.isEditing = !todo.isEditing;
        localStorage.setItem("todo", JSON.stringify(todosArr));
      }
    }
    render();
  }
}

async function deleteTodo(id) {
  const res = await fetch(`https://todo-for-n92.cyclic.app/todos/${id}`, {
    method: "DELETE",
    headers: { "x-access-token": token },
  });
  console.log(res);
  if (res.status === 200) {
    const isAccepted = window.confirm(
      "Do you really want to delete this todo?"
    );

    if (isAccepted) {
      const newTodosArr = todosArr.filter((todo) => todo.id !== id);
      todosArr = newTodosArr;
      localStorage.setItem("todo", JSON.stringify(todosArr));
      render();
    }
  } else {
    console.error(res.statusText);
  }
}

const editForms = document.querySelectorAll("#editForm");

async function editTodo(e, id) {
  e.preventDefault();

  const task = e.target[0].value;

  const res = await fetch(`https://todo-for-n92.cyclic.app/todos/${id}`, {
    method: "PUT",
    headers: {
      "x-access-token": token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ task }),
  });

  if (res.status === 200) {
    const updatedTodo = await res.json();
    for (let i = 0; i < todosArr.length; i++) {
      const todo = todosArr[i];
      if (todo.id === id) {
        todo.task = updatedTodo.task;
        todo.isEditing = !todo.isEditing;
        localStorage.setItem("todo", JSON.stringify(todosArr));
      }
    }
    render();
  }
}

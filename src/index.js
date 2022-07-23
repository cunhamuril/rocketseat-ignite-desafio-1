const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);

  if (!user) {
    return response.status(404).json({ error: "User not found!" });
  }

  request.user = user;

  return next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  const isUserExists = users.some((user) => user.username === username);

  if (isUserExists) {
    return response.status(400).json({ error: "Username already exists!" });
  }

  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };

  users.push(newUser);

  response.status(201).json(newUser);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { username } = request.user;

  const { todos } = users.find((user) => user.username === username);

  response.json(todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;

  const newTodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  users.forEach((user) => {
    if (user.username === request.user.username) {
      user.todos.push(newTodo);
    }
  });

  return response.status(201).json(newTodo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { title, deadline } = request.body;

  const userIndex = users.findIndex(
    (user) => user.username === request.user.username
  );

  const todoIndex = users[userIndex].todos.findIndex((todo) => todo.id === id);

  if (todoIndex === -1) {
    return response.status(404).json({ error: "To do not found!" });
  }

  users[userIndex].todos[todoIndex].title = title;
  users[userIndex].todos[todoIndex].deadline = new Date(deadline);

  const updatedTodo = users[userIndex].todos[todoIndex];

  return response.status(201).json(updatedTodo);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;

  const userIndex = users.findIndex(
    (user) => user.username === request.user.username
  );

  const todoIndex = users[userIndex].todos.findIndex((todo) => todo.id === id);

  if (todoIndex === -1) {
    return response.status(404).json({ error: "To do not found!" });
  }

  users[userIndex].todos[todoIndex].done = true;

  const updatedTodo = users[userIndex].todos[todoIndex];

  return response.status(201).json(updatedTodo);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;

  const userIndex = users.findIndex(
    (user) => user.username === request.user.username
  );

  const todoIndex = users[userIndex].todos.findIndex((todo) => todo.id === id);

  if (todoIndex === -1) {
    return response.status(404).json({ error: "To do not found!" });
  }

  users[userIndex].todos.splice(todoIndex, 1);

  return response.status(204).json();
});

module.exports = app;

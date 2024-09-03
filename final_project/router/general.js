const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');

public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    if (isValid(username)) {
        users.push({"username": username, "password": password});
        return res.status(200).send("User successfully registered. Now you can log in");
    } else {
        return res.status(404).send("User already exists!");
    }
  }
  return res.status(404).send("Unable to register user.");
});

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
  try {
    const response = await axios.get('http://localhost:5000/books');
    const books = response.data;
    return res.send(JSON.stringify(books, null, 4));
  } catch {
    return res.status(500).json({message: "Error getting book list"});
  }
});

public_users.get('/books', function (req, res) {
  return res.send(JSON.stringify(books, null, 4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
  const ISBN = req.params.isbn;
  try {
    const response = await axios.get('http://localhost:5000/books');
    const books = response.data;
    if (books[ISBN]) {
      return res.send(JSON.stringify(books[ISBN], null, 4));
    } else {
        return res.status(404).send(`Book with ISBN ${ISBN} not found.`);
    }
  } catch {
    return res.status(500).json({message: "Error getting book details by ISBN"});
  }
});
  
// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
  const author = req.params.author;
  try {
    const response = await axios.get('http://localhost:5000/books');
    const books = response.data;
    const matchingBooks = Object.values(books).filter(book => book.author === author);
    if (matchingBooks.length > 0) {
      return res.send(JSON.stringify(matchingBooks, null, 4));
    } else {
        return res.status(404).send(`No books found by author ${author}`);
    }
  } catch {
    return res.status(500).json({message: "Error getting book details by author"});
  }
});

// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
  const title = req.params.title;
  try {
    const response = await axios.get('http://localhost:5000/books');
    const books = response.data;
    const matchingBook = Object.values(books).filter(book => book.title === title);
    if (matchingBook.length > 0) {
      return res.send(JSON.stringify(matchingBook, null, 4));
    } else {
      return res.status(404).send(`No book found under title ${title}`);
    }
  } catch {
    return res.status(500).json({message: "Error getting book details by title"});
  }
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
  const ISBN = req.params.isbn;
  if (books[ISBN]) {
    const bookReviews = books[ISBN].reviews;
    return res.send(JSON.stringify(bookReviews, null, 4));
  } else {
      return res.status(404).send(`Book with ISBN ${ISBN} not found.`);
  }
});

module.exports.general = public_users;
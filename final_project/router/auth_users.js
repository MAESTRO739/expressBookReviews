const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => { //returns boolean
  let userswithsamename = users.filter((user) => {
        return user.username === username;
    });

    if (userswithsamename.length > 0) {
        return false;
    } else {
        return true;
    }
}

const authenticatedUser = (username,password)=>{ //returns boolean
  let validusers = users.filter((user) => {
    return (user.username === username && user.password === password);
  });

  if (validusers.length > 0) {
    return true;
  } else {
    return false;
  }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
      return res.status(404).json({ message: "Error logging in" });
  }

  if (authenticatedUser(username, password)) {
      let accessToken = jwt.sign({
          data: password
      }, 'access', { expiresIn: 60 * 60 });

      req.session.authorization = {
          "accessToken": accessToken, "username": username
      }
      return res.status(200).send(JSON.stringify("User successfully logged in", null, 4));
  } else {
      return res.status(208).json({ message: "Invalid Login. Check username and password" });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const username = req.session.authorization.username;
  const ISBN = req.params.isbn;
  const review = req.query.review;

  if (review) {
    if (books[ISBN]) {
      if (books[ISBN].reviews[username]) {
        books[ISBN].reviews[username] = review;
        return res.json({message: `Review of book with ISBN ${ISBN} successfully modified`});
      } else {
          books[ISBN].reviews[username] = review;
          return res.json({message: `Review of book with ISBN ${ISBN} successfully added`});
      }

    } else {
        return res.status(404).send(`Book with ISBN ${ISBN} not found`);
    }

  } else {
      return res.status(400).json({message: "Please provide a review"});
  }
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const ISBN = req.params.isbn;
  const username = req.session.authorization.username;

  if (username) {
    if (!isValid(username)) {
      if (books[ISBN]) {
        if (books[ISBN].reviews[username]) {
          delete books[ISBN].reviews[username];
          return res.status(200).json({message: `Review for book with ISBN ${ISBN} successfully deleted`});
        } else {
            return res.status(404).json({message: `Review not found for book with ISBN ${ISBN}`});
        }
      } else {
          return res.status(404).json({message: `Book with ISBN ${ISBN} not found`});
      }
    } else {
        return res.status(401).json({message: `User with username ${username} not found`});
    }
  } else {
      return res.status(401).json({message: "Unauthorized"});
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
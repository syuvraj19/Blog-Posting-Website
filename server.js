/*********************************************************************************
 *  WEB322 – Assignment 02
 *  I declare that this assignment is my own work in accordance with Seneca Academic Policy.
 *  No part *  of this assignment has been copied manually or electronically from any other source
 *  (including 3rd party web sites) or distributed to other students.
 *
 *  Name: yuvraj singh
 *  Student ID: 155580210
 *  Date: 30/09/2022
 *
 *  Online (Cyclic) Link:
 *
 ********************************************************************************/

const express = require("express");
const path = require("path");
const service = require("./blog-service");

const app = express();

const port = process.env.port || 8080;

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.redirect("/about");
});

app.get("/about", (req, res) => {
  res.sendFile(path.join(__dirname, "views/about.html"));
});

app.get("/blog", (req, res) => {
  service
    .getPublishedPosts()
    .then((data) => res.json(data))
    .catch((err) => res.json(err));
});

app.get("/posts", (req, res) => {
  service
    .getAllPosts()
    .then((data) => res.json(data))
    .catch((err) => res.json(err));
});

app.get("/categories", (req, res) => {
  service
    .getCategories()
    .then((data) => res.json(data))
    .catch((err) => res.json(err));
});

app.use((req, res) => {
    res.status(404).send("Page Not Found");
  });

app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
  service
    .initialize()
    .then((data) => console.log(data))
    .catch((err) => console.log(err));
});

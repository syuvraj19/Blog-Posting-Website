/*********************************************************************************
 *  WEB322 – Assignment 04
 *  I declare that this assignment is my own work in accordance with Seneca Academic Policy.
 *  No part *  of this assignment has been copied manually or electronically from any other source
 *  (including 3rd party web sites) or distributed to other students.
 *
 *  Name: yuvraj Singh
 *  Student ID: 155580210
 *  Date: 14/10/2022
 *
 *  Online (Cyclic) Link: https://drab-pear-goshawk-coat.cyclic.app/about
 *
 ********************************************************************************/

 var express = require("express");
var app = express();
var path = require('path');
const multer = require("multer");
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const exphbs = require('express-handlebars');
const stripJs = require('strip-js');
var blogservice = require(__dirname + '/blog-service.js');

var HTTP_PORT = process.env.PORT || 8080;

app.engine('.hbs', exphbs.engine({ 
  extname: ".hbs", 
  defaultLayout: "main",
  helpers: {
      navLink: function(url, options){
          return '<li' + 
              ((url == app.locals.activeRoute) ? ' class="active" ' : '') + '><a href="' + url + '">' + options.fn(this) + '</a></li>'; },
      equal: function (lvalue, rvalue, options) {
          if (arguments.length < 3)
              throw new Error("Handlebars Helper equal needs 2 parameters");
          if (lvalue != rvalue) {
              return options.inverse(this);
          } else {
              return options.fn(this);
          }
      },
      safeHTML: function(context){
          return stripJs(context);
          }          
  } 
}));

app.set("view engine", ".hbs");

function onHttpStart(){
    console.log('Express http server listening on ' + HTTP_PORT);
}

cloudinary.config({
  cloud_name: 'dwslgxp7b',
  api_key: '474295251232519',
  api_secret: 'Of9poBBYwVWlYvfiWJBtgJX5nl8',
  secure: true
});


const upload = multer() // no { storage: storage }

app.use(express.static('public'));

app.use(function(req,res,next){
  let route = req.path.substring(1);
  app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
  app.locals.viewingCategory = req.query.category;
  next();
});


app.get('/', (req, res) =>
{
    res.redirect('/blog')
});

app.get('/about', (req, res) => 
{
  res.render(path.join(__dirname + "/views/about.hbs"));  
});

app.get('/blog', async (req, res) => {

  let viewData = {};

  try{
      let posts = [];

      if(req.query.category){
          posts = await blogservice.getPublishedPostsByCategory(req.query.category);
      }else{
          posts = await blogservice.getPublishedPosts();
      }

      posts.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));

      let post = posts[0]; 

      viewData.posts = posts;
      viewData.post = post;

  }catch(err){
      viewData.message = "no results";
  }

  try{
      let categories = await blogservice.getCategories();

      viewData.categories = categories;
  }catch(err){
      viewData.categoriesMessage = "no results"
  }

  res.render("blog", {data: viewData})

});

app.get('/blog/:id', async (req, res) => {

  let viewData = {};

  try{
      let posts = [];

      if(req.query.category){
          posts = await blogservice.getPublishedPostsByCategory(req.query.category);
      }else{
          posts = await blogservice.getPublishedPosts();
      }

      posts.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));

      viewData.posts = posts;

  }catch(err){
      viewData.message = "no results";
  }

  try{
      viewData.post = await blogservice.getPostById(req.params.id);
  }catch(err){
      viewData.message = "no results"; 
  }

  try{
      let categories = await blogservice.getCategories();

      viewData.categories = categories;
  }catch(err){
      viewData.categoriesMessage = "no results"
  }

  res.render("blog", {data: viewData})
});

app.get("/posts", function (req, res) {

    if (req.query.category) {
      blogservice.getPostsByCategory(req.query.category).then((data) => {
        res.render("posts", {posts: data});
      }).catch(function(err){
        res.render("posts", {message: "no results"});
      })
    }

     else if (req.query.minDate) {
      blogservice.getPostsByMinDate(req.query.minDate).then((data) => {
        res.render("posts", {posts: data});
      }).catch(function(err){
        res.render("posts", {message: "no results"});
      })
    }

    else {
      blogservice
        .getAllPosts()
      .then(function (data) {
        res.render("posts", {posts: data});
      })
      .catch(function (err) {
        res.render("posts", {message: "no results"});
      });
    }
  });

  app.get('/post/:id',(req,res)=>{
    blogservice.getPostById(req.params.id).then((data)=>{
 
     res.json(data);
    }) .catch(function (err) {
       res.json({ message: err });
     });
 
 
   });

app.get("/categories", function (req, res)
{
    blogservice.getCategories().then(function (data)
    {
      res.render("categories", {categories: data});
    }).catch(function(err) {
      res.render("categories", {message: "no results"});
    })
});


app.get('/posts/add', function (req,res)
{
res.render(path.join(__dirname + "/views/addPost.hbs"));
});

app.post("/posts/add", upload.single("featureImage"), (req,res)=>{

  if(req.file){
      let streamUpload = (req) => {
          return new Promise((resolve, reject) => {
              let stream = cloudinary.uploader.upload_stream(
                  (error, result) => {
                      if (result) {
                          resolve(result);
                      } else {
                          reject(error);
                      }
                  }
              );
  
              streamifier.createReadStream(req.file.buffer).pipe(stream);
          });
      };
  
      async function upload(req) {
          let result = await streamUpload(req);
          console.log(result);
          return result;
      }
  
      upload(req).then((uploaded)=>{
          processPost(uploaded.url);
      });
  }else{
      processPost("");
  }

  function processPost(imageUrl){
      req.body.featureImage = imageUrl;
      req.body.postDate = new Date().toISOString().split('T')[0];
      blogservice.addPost(req.body).then(post=>{
          res.redirect("/posts");
      }).catch(err=>{
          res.status(500).send(err);
      })
  }   
});

app.get('*', function(req, res){
    res.status(404).send("Page Not Found!");
  });

blogservice.initialize().then(() => 
{
    app.listen(HTTP_PORT, onHttpStart());
}).catch (() => {
    console.log("ERROR : From starting the server");
});
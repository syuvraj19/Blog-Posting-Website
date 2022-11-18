const fs = require("fs");

var posts = [];
var categories = [];

exports.initialize = () => {
  return new Promise((resolve, reject) => {
    fs.readFile("./data/posts.json", "utf8", (err, data) => {
      if (err) {
        reject("unable to read file");
      } else {
        posts = JSON.parse(data);
      }
    });

    fs.readFile("./data/categories.json", "utf8", (err, data) => {
      if (err) {
        reject("unable to read file");
      } else {
        categories = JSON.parse(data);
      }
    });
    resolve();
  });
};

exports.getAllPosts = () => {
  return new Promise((resolve, reject) => {
    if (posts.length == 0) {
      reject("no results returned");
    } else {
      resolve(posts);
    }
  });
};

exports.getPublishedPosts = () => {
  return new Promise((resolve, reject) => {
    var publish_posts = posts.filter((post) => post.published == true);

    if (publish_posts.length == 0) {
      reject("no results returned");
    } else {
      resolve(publish_posts);
    }
  });
};

exports.getCategories = () => {
  return new Promise((resolve, reject) => {
    if (categories.length == 0) {
      reject("no results returned");
    } else {
      resolve(categories);
    }
  });
};

module.exports.addPost = (postData) => {
  return new Promise(function (resolve, reject) {
    try {
      postData.published = postData.published ? true : false;
      postData.id = posts.length + 1;
      postData.postDate = postData.postDate.split("T")[0];
      posts.push(postData);
      resolve(postData);
    } catch (err) {
      reject();
    }
  });
};

module.exports.getPostsByMinDate = (minDateStr) => {
  {
    return new Promise(function (resolve, reject) {
      var date_posts = [];

      var j = 0;

      for (var i = 0; i < posts.length; i++) {
        if (new Date(posts[i].postDate) >= new Date(minDateStr)) {
          date_posts[j++] = posts[i];
        }
      }
      if (date_posts.length == 0) {
        reject("no results returned");
      } else {
        resolve(date_posts);
      }
    });
  }
};

module.exports.getPostsByCategory = (category) => {
  {
    return new Promise(function (resolve, reject) {
      var category_posts = [];

      var j = 0;

      for (var i = 0; i < posts.length; i++) {
        if (posts[i].category == category) {
          category_posts[j++] = posts[i];
        }
      }
      if (category_posts.length == 0) {
        reject("no results returned");
      } else {
        resolve(category_posts);
      }
    });
  }
};

module.exports.getPublishedPostsByCategory = function (category) {
  return new Promise((resolve, reject) => {
    let filteredPosts = posts.filter(
      (post) => post.published == true && post.category == category
    );
    filteredPosts.length > 0
      ? resolve(filteredPosts)
      : reject("no results returned");
  });
};

module.exports.getPostById = (id) => {
  return new Promise((resolve, reject) => {
    var id_posts = [];
    var j = 0;
    for (var i = 0; i < posts.length; i++) {
      if (posts[i].id == id) {
        id_posts[j++] = posts[i];
      }
    }

    if (id_posts.length == 0) {
      reject("no results returned");
    } else {
      resolve(id_posts);
    }
  });
};
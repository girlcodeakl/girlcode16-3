//set up
var express = require('express')
var app = express();
var bodyParser = require('body-parser')
var database = null;

//If a client asks for a file,
//look in the public folder. If it's there, give it to them.
app.use(express.static(__dirname + '/public'));

//this lets us read POST data
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())


//make an empty list of ideas
var posts = [];
var idea = {};
var time = new Date();
console.log(time.getHours() + ":" + time.getMinutes() + ":" + time.getSeconds());
idea.text = "Two cats who solve crimes in Dunedin";
idea.image = "http://www.catbehaviorassociates.com/wp-content/uploads/2012/03/catsweb2-016.jpg";
idea.time = time;
idea.id = 15001;
posts.push(idea);
idea.likes = 0;



//let a client GET the list of ideas
var sendIdeasList = function (request, response) {
  response.send(posts);
}
app.get('/ideas', sendIdeasList);

//let a client POST new ideas
var saveNewIdea = function (request, response) {
  console.log(request.body.idea); //write it on the command prompt so we can see
  console.log(request.body.author);
  var idea = {};
  idea.text = request.body.idea;
  idea.author = request.body.author;
  idea.time = new Date();
  idea.likes = 0;
  if (request.body.image === "" ) {
    idea.image = "https://trevorslee.files.wordpress.com/2015/03/montoya-meme.jpg"
  }
  else {
    idea.image = request.body.image;
  }
  idea.id = Math.round(Math.random() * 100000);
  console.log(time.getHours() + ":" + time.getMinutes() + ":" + time.getSeconds());
  posts.push(idea);
  response.send("thanks for your idea. Press back to add another");
  var dbPosts = database.collection('posts');
  dbPosts.insert(idea);
}

app.post('/ideas', saveNewIdea);

app.post("/liked", function (req, res) {
   var searchId = req.body.postId;
   console.log(searchId);

var results = posts.filter(function (post) { return post.id == searchId; });
   if (results.length > 0) {
     if (results[0].likes === undefined){
       results[0].likes = 0;
     }
     results[0].likes = results[0].likes + 1;
     res.send(results[0]);

     var databasePosts = database.collection("posts");
     databasePosts.update({id:results[0].id}, results[0]);

   }
   else res.send(" ")

});

app.get('/idea', function (req, res) {
   var searchId = req.query.id;
   console.log("Searching for post " + searchId);
   var results = posts.filter(function (post) { return post.id == searchId; });
   if (results.length > 0) {
     res.send(results[0]);
   } else {
   res.send(null);
   }
});



var mongodb = require('mongodb');
var uri = 'mongodb://girlcodecat:camel@ds019746.mlab.com:19746/newdeployment';
mongodb.MongoClient.connect(uri, function(err, newdb) {
  if(err) throw err;
  console.log("yay we connected to the database");
  database = newdb;
  var dbPosts = database.collection('posts');
  dbPosts.find(function (err, cursor) {
    cursor.each(function (err, item) {
      if (item != null) {
        posts.push(item);
      }
    });
  });
});
//listen for connections on port 3000
app.listen(process.env.PORT || 3000);
console.log("I am listening...");

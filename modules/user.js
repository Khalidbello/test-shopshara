import { Router } from "express";
import createClient from "./mongodb.js";
import { ObjectId } from "mongodb";
import { deletePost, editPost, logout } from "./helper_functions.js";

const router = new Router();


// middle ware for user router

router.use((req, res, next)=> {
  if (req.session.email && req.session.type === "user") {
     next();
  } else {
    res.status(401);
    return res.json({
      status: "unAuthorised",
      message: "user not logged in"
    });
  };
});


// route for signing users out 

router.post('/logout', (req, res) => {
  // Destroy the session
  logout(req, res);
}); // end of logout endpoint



// create post route
router.post("/create-post", async (req, res) => {
  try {
    console.log("req body", req.body);
    let { title, content } = req.body;
    const dateCreated = new Date();

    if (!title || !content) {
      res.status(400);
      return res.json({
        stataus: "bad request",
        message: "some parameters to create a post are missing"
      });
    };

    title = title.trim();
    content = content.trim();
    
    // addimg post to database
    const client = createClient();
    client.connect();
    const collection = client.db(process.env.DB_NAME).collection(process.env.POST_COLL);
    
    // each post will be identified by a cretor id 
    // which is the id of the user who created it 
    const newPost = await collection.insertOne({ title, content, dateCreated, creator: req.session.email, comments: [] });

    res.json({
      status: 'successful',
      message: 'post created succesfully',
      postId: newPost.insertedId
    });
    client.close();
  } catch (err) {
    console.log("error in creating post", err);
    res.status(500);
    res.json({
      status: "error",
      message: "error creating post"
    });
  };
}); // end of create post endpoint



// routes to edit post

router.put("/edit-post/:postId", async (req, res) => {
  editPost(req, res);
}); // end of edit post enxpoint


// routes for commenting
router.post("/comment/:postId", async (req, res) => {
  try {
    const postId = new ObjectId(req.params.postId);
    let comment = req.body.comment;
    const dateCommented = new Date();
    console.log("in edit post", postId, comment);

    if (!comment || !postId) {
      res.status(400);
      return res.json({
        stataus: "bad request",
        message: "some parameters to edit post are missing"
      });
    };

    comment = comment.trim();
    // adding comment
    const client = createClient();
    await client.connect();
    const collection = client.db(process.env.DB_NAME).collection(process.env.POST_COLL);

    const data = await collection.findOne({ _id: postId });
    console.log("post to comment", data);
    
    if (!data) {
      client.close();
      res.status(404);
      return res.json({ status: "error", message: "post not found" });
    };

    const newComment = {comment: comment, dateCommented, user: req.session.email};
    const commented = await collection.updateOne({_id: postId}, {$push: {
      comments: newComment
    }});
    console.log("new commemt", commented);
    
    res.json({
      status: "successful",
      message: "commented added successfully"
    });
    client.close();
  } catch (err) {
    console.log("error in commenting", err)
    res.status(500);
    res.json({
      status: "server error",
      message: "something went wrong"
    });
  };
}); // end of comment end point


// route to delete post
router.delete("/delete-post/:postId", async (req, res) => {
  deletePost(req, res);
});


export default router;
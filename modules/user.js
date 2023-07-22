import { Router } from "express";
import createClient from "./mongodb.js";
import { ObjectId } from "mongodb";

const router = new Router();


// route corsigning users out 
router.post('/logout', (req, res) => {
  // Destroy the session
  req.session.destroy((err) => {
    if (err) {
      console.log('Error destroying session:', err);
      res.status(502);
      res.json({
        status: "serverError",
        message: "failed to logout",
      });
    } else {
      // Redirect the user to a logged-out page or login page
      res.redirect('/');
    }
  });
});

// create post route
router.post("/create-post", async (req, res) => {
  try {
    console.log("req body", req.body);
    const { title, content } = req.body;
    const dateCreated = new Date();

    if (!title || !content) {
      res.status(400);
      return res.json({
        stataus: "bad request",
        message: "some parameters to create a post are missing"
      });
    }

    // addimg post to database
    const client = createClient();
    client.connect();
    const collection = client.db(process.env.DB_NAME).collection(process.env.POST_COLL);

    // each post will be identified by a cretor id 
    // which is the id of the user who created it 
    const newPost = await collection.insertOne({ title, content, dateCreated, creatorId: req.session._id });

    res.json({
      status: 'successful',
      message: 'post created succesfully',
      postId: newPost.insertedId
    });
  } catch (err) {
    console.log("error in creating post", err);
    res.status(500);
    res.json({
      status: "error",
      message: "error creating post"
    });
  };
});



// routes to edit post

router.put("/edit-post/:postId", async (req, res) => {
  try {
    const postId = new ObjectId(req.params.postId);
    const { title, content } = req.body;
    const dateEdited = new Date();
    console.log("in edit post", postId, title, content);

    if (!title || !content || !postId) {
      res.status(400);
      return res.json({
        stataus: "bad request",
        message: "some parameters to edit post are missing"
      });
    }

    // addimg post to database
    const client = createClient();
    await client.connect();
    const collection = client.db(process.env.DB_NAME).collection(process.env.POST_COLL);

    const data = await collection.findOne({ _id: postId });
    console.log("to update data", data);

    if (!data) {
      res.status(404);
      return res.json({status: "error", message: "post not found"});
    }

    if (req.session._id !== data.creatorId) {
      res.status(401);
      return res.json({
        status: "unAthorised",
        message: "you do not have authority to edit this post"
      });
    };

    const editedPost = await collection.updateOne({_id: postId}, {$set: { title, content, dateEdited}});
    res.json({ status: "successful", message: "post edited succesfully" });
  } catch (err) {
    console.log("error in creating post", err);
    res.status(500);
    res.json({
      status: "error",
      message: "error creating post"
    });
  };
});



// route to delete post
router.delete("/delete-post/:postId", async (req, res) => {
  try {
    const postId = new ObjectId(req.params.postId);
    console.log("post id in deleted", postId);
    if (!postId) {
      res.status(400);
      return res.json({
        stataus: "bad request",
        message: "some id of post to delete is missing missing"
      });
    };

    // addimg post to database
    const client = createClient();
    await client.connect();
    const collection = client.db(process.env.DB_NAME).collection(process.env.POST_COLL);
    // await collection.drop(); return res.send("deleted");
    
    const data = await collection.findOne({_id: postId });
    console.log("to delete data", data);
    
    if (!data) {
      res.status(404);
      return res.json({status: "error", message: "post not found"});
    };
    
    if (req.session._id !== data.creatorId) {
      res.status(401);
      return res.json({
        status: "unAthorised",
        message: "you do not have authority to delete this post"
      });
    };

    const deleted = await collection.deleteOne({ _id: postId });
    console.log("post deletd", deleted);
    
    res.json({
      status: "successful",
      message: "post deleted succesfully"
    });
  } catch (err) {
    console.log("error in deleteing post", err);
    res.json({
      status: "error",
      message: "an error occured",
    });
  };
});


export default router;
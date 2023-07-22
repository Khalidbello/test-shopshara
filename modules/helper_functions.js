// helper functions
import createClient from "./mongodb.js";
import { ObjectId } from "mongodb";


// function to delete post
async function deletePost(req, res, ifAdmin=false) {
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

    // deleting post from database
    const client = createClient();
    await client.connect();
    const collection = client.db(process.env.DB_NAME).collection(process.env.POST_COLL);
    const data = await collection.findOne({ _id: postId });
    console.log("to delete data", data);

    if (!data) {
      client.close();
      res.status(404);
      return res.json({ status: "error", message: "post not found" });
    };

    // to do dependent on account type
    if (!ifAdmin) {
      console.log("not admin");
      if (req.session.email !== data.creator) {
        client.close();
        res.status(401);
        return res.json({
          status: "unAthorised",
          message: "you do not have authority to delete this post"
        });
      };
    };

    const deleted = await collection.deleteOne({ _id: postId });
    console.log("post deletd", deleted);

    res.json({
      status: "successful",
      message: "post deleted succesfully"
    });
    client.close();
  } catch (err) {
    console.log("error in deleteing post", err);
    res.json({
      status: "error",
      message: "an error occured",
    });
  };
}; // end of delete post function


// function to edit post
async function editPost(req, res, ifAdmin=false) {
  try {
    const postId = new ObjectId(req.params.postId);
    let  { title, content } = req.body;
    const lastEdited = new Date();
    console.log("in edit post", postId, title, content);

    if (!title || !content || !postId) {
      res.status(400);
      return res.json({
        stataus: "bad request",
        message: "some parameters to edit post are missing"
      });
    };

    // addimg post to database
    title = title.trim();
    content = content.trim();
    const client = createClient();
    await client.connect();
    const collection = client.db(process.env.DB_NAME).collection(process.env.POST_COLL);

    const data = await collection.findOne({ _id: postId });
    console.log("to update data", data);

    if (!data) {
      client.close();
      res.status(404);
      return res.json({ status: "error", message: "post not found" });
    };

    if (!ifAdmin) {
      if (req.session.email !== data.creator) {
        client.close();
        res.status(401);
        return res.json({
          status: "unAthorised",
          message: "you do not have authority to edit this post"
        });
      };
    };

    const editedPost = await collection.updateOne({ _id: postId }, { $set: { title, content, lastEdited } });
    console.log("erdited post", editedPost);
    
    res.json({ status: "successful", message: "post edited succesfully" });
  } catch (err) {
    console.log("error in editing post", err);
    res.status(500);
    res.json({
      status: "error",
      message: "error editing post"
    });
  };
};  // end of edit post end point


function logout (req, res) {
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
    };
  });
}; // end of logout



// function to send post to visitors

async function sendVisitorResponse (req, res) {
  const skip = req.query.skip || 0;
  const limit = req.query.limit || 20;
  const client = createClient();
  await client.connect();
  const collection = client.db(process.env.DB_NAME).collection(process.env.POST_COLL);

  const data = await  collection.find({}).skip(skip).limit(limit).toArray();
  return res.send(data);
}; // end of sendVisitorResponse


export { deletePost, editPost, logout, sendVisitorResponse };
import { Router } from "express";

import { deletePost, editPost, logout } from "./helper_functions.js";

const router = new Router();


// middle ware for user router
router.use((req, res, next)=> {
  if (req.session.email && req.session.type === "admin") {
     next();
  } else {
    res.status(401);
    return res.json({
      status: "unAuthorised",
      message: "user does no have admin access"
    });
  };
});


// admin log out end point
router.post("/logout", (req, res) => {
  logout(req, res);
}); // end of logout end point


// delete post end point

router.delete("/delete-post/:postId", async (req, res) => {
  deletePost(req, res, true);
}); // end of delete post end point 



// edit post end point

router.put("/edit-post/:postId", async (req, res) => {
  editPost(req, res, true);
}); // end of edit post end point 

export default router;
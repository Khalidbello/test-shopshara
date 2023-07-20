import { Router } from "express";
import createClient from "./mongodb.js";

const router = new Router();


// sign up route
router.post("/sign-up", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(email, password);
    
    const client = createClient();
    await client.connect();
    const users = client.db(process.env.DB_NAME).collection(process.env.USERS_COLL);

    // check if account with email alredy exists
    const user = await users.findOne({ email });
    console.log("user in sigin", user);

    if (user) {
      return res.json({
        status: "existing",
        message: "user with alredy exists"
      });
    };

    const response = await users.insertOne({ email, password });
    console.log("account created", response);
    
    req.session.email = email;
    req.session._id = response.insertedId;
    res.redirect("/");
  } catch (err) {
    console.log("error in signup api", err);
    res.json({
      status: "error",
      message: "something went wrong"
    });
  };
}); // end of sign up route


// login route

router.post("/sign-in", async (req, res) => {
  try {
    const { email, password } = req.body;
    const client = createClient();
    await client.connect();
    const users = client.db(process.env.DB_NAME).collection(process.env.USERS_COLL);

    // check if account with email exists in users

    const user = await users.findOne({ email });
    console.log("user sign in", user);
    if (!user) {
      return res.json({
        status: "error",
        message: "no user with email found"
      });
    };

    if (user.password !== password) {
      return res.json({
        status: "error",
        message: "the entered password doesn't match email"
      });
    };

    // setting session
    req.session.email = email;
    req.session._id = user._id;
    res.redirect("/");
  } catch (err) {
  };
});

export default router;
import { Router } from "express";
import emailValidator from "email-validator";
import createClient from "./mongodb.js";


const router = new Router();


// sign up route
router.post("/sign-up", async (req, res) => {
  try {
    let { email, password } = req.body;
    console.log(email, password);

    if (!email || !password) {
      res.status(402);
      return res.json({
        status: "bad request",
        message: "email or password missing"
      });
    };

    email = email.trim();
    password = password.trim();
    
    if (!emailValidator.validate(email)) {
      res.status(402);
      return res.json({
        status: "bad request",
        message: "invalid email recieved"
      });
    };

    if (password.length < 5) {
      res.status(402);
      return res.json({
        status: "bad request",
        message: "password must be longer than six characters"
      });
    }
    
    const client = createClient();
    await client.connect();
    const users = client.db(process.env.DB_NAME).collection(process.env.USERS_COLL);

    // check if account with email alredy exists
    const user = await users.findOne({ email});
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
    let { email, password } = req.body;

    if (!email || !password) {
      res.status(402);
      return res.json({
        status: "bad request",
        message: "email or password missing"
      });
    };

    email = email.trim();
    password = password.trim();
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
    req.session.type = "user";
  
    res.redirect("/");
  } catch (err) {
  };
});


// admin sign in route
router.post("/admin-sign-in", async (req, res) => {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      res.status(401);
      return resjson({
        status: "bad request",
        message: "some form datas are missing"
      });
    };

    email = email.trim();
    password = password.trim();
    const client = createClient();
    client.connect();
    const collection = client.db(process.env.DB_NAME).collection(process.env.ADMIN_COLL);
    const admin = await collection.findOne({ email });

    if (!admin) {
      res.status(404);
      return res.json({
        status: "not found",
        message: "Admin with email not found"
      });
    };
    if (admin.password !== password) {
      res.status(400);
      return res.json({
        status: "bad request",
        message: "wrong password provided"
      });
    };

    req.session.type = "admin";
    req.session.email = admin.email;

    res.redirect("/");
  } catch (err) {
    comsole.log("error in admin sign in", err);
    res.status(500);
    res.json({
      status: "error",
      message: "something went wrong"
    });
  };
});

export default router;
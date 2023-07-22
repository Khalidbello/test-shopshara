import express from 'express';
import session from 'express-session';
import signingRouter from "./modules/signings.js";
import userRouter from './modules/user.js';
import adminRouter from './modules/admin.js';
import { sendVisitorResponse } from './modules/helper_functions.js';

const app = express();


// locking in middleware
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 3600000
  }
}));



app.get('/', (req, res) => {
  if (req.session.email) {
    if (req.session.type === "admin") return res.send('shop share test blog web app accessed as admin');
    return res.send('shop share test blog web app accessed as user')
  };
  //res.send('shop share test blog web app accessed as visitor')
  sendVisitorResponse(req, res);
});


// locking in routes as middlewares
app.use("/", signingRouter);
app.use("/user", userRouter);
app.use("/admin", adminRouter);


app.listen(3000, () => {
  console.log('server started');
});

import express from 'express';
import session from 'express-session';
import userRouter from './modules/user.js';
import adminRouter from './modules/admin.js';
import visitorRouter from './modules/visitor.js';


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
  if (req.session.email && req.session._id) {
    return res.send('shop share test blog web app accessed as user')
  }
  res.send('shop share test blog web app accessed as visitor')
});

// locking in routes as middlewares

app.use("/user", userRouter);
app.use("/admin", adminRouter);


app.listen(3000, () => {
  console.log('server started');
});
import express from 'express'
const app = express();

import userModel from "./models/user.js"
import postModel from './models/post.js';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcrypt'
import jwt from "jsonwebtoken"

app.set("view engine", 'ejs');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())

// jwt verification middleware 

function verifyToken(req, res, next) {
  const token = req.cookies.token;
  if (!token) {
    return res.redirect("/login");
  }
  let data = jwt.verify(token, "secret");
  req.user = data;
  next();
}

// rendering the basic pages

app.get("/", (req, res) => {
  res.render("index");
})

app.get("/login", (req, res) => {
  res.render("login");
})

app.get("/posts", verifyToken,async (req, res) => {
  const userID = req.user.userID;
  const postData = await postModel.find({ user: userID });
  res.render("posts", { user: req.user , posts: postData })
})

app.get("/createPost", (req, res) => {
  res.render('createPost');
})

// like page logic

app.get("/like/:id", verifyToken, async (req, res) => {
  
    let post = await postModel.findById(req.params.id);
  

    const userID = req.user.userID;

    // Toggle like/unlike
    const index = post.like.indexOf(userID);
    if (index === -1) {
      post.like.push(userID); // Like
    } else {
      post.like.splice(index, 1); // Unlike
    }

    await post.save();
    res.redirect("/posts");
});

//logout
app.get("/logout",verifyToken,(req,res)=>{
  res.clearCookie("token");
  res.redirect("/login");
})

//delete post
app.get("/delete/:id",verifyToken,async (req,res)=>{
 let deleted = await postModel.deleteOne({_id : req.params.id});
 res.redirect("/posts");
})

// post routes

app.post("/create", async (req, res) => {
  const { name, age, email, username, password } = req.body;

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);

  await userModel.create({
    name,
    age,
    email,
    username,
    password: hash,
  });
  res.redirect("/login");
});

app.post("/login", async (req, res) => {
  let { email, password } = req.body;

  let user = await userModel.findOne({ email });
  if (!user) return res.send("email or pssword is incorrect");
  let isMatch = await bcrypt.compare(password, user.password)
  if (isMatch) {
    let token = jwt.sign({ email, username: user.username, userID: user._id }, "secret");
    res.cookie("token", token);

    return res.redirect("/posts");
  }
  else return res.send("email or password is incorrect");
})

app.post("/createPost", verifyToken, async (req, res) => {
  let { image, description } = req.body;

  let post =await postModel.create({
    image,
    description,
    user: req.user.userID
  })

  let user =await userModel.findOne({ _id: req.user.userID })
  user.posts.push(post._id)
  user.save();

res.redirect("/posts")

})


app.listen(3000)

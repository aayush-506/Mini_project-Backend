import express from 'express'
const app = express();

import userModel from "./models/user.js"
import cookieParser from 'cookie-parser';
import bcrypt from 'bcrypt'

app.set("view engine", 'ejs');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())

// rendering the basic pages

app.get("/", (req, res) => {
    res.render("index");
})

app.get("/login", (req, res) => {
    res.render("login");
})

app.get("/posts", (req, res) => {
    res.render("posts")
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

app.post("/login",async (req,res)=>{
    let {email,password} = req.body;
    
  let user =await userModel.findOne({email});
  if(!user) return res.send("email or pssword is incorrect");
  let isMatch =await bcrypt.compare(password,user.password)
    if(isMatch) return res.redirect("/posts");
    else return res.send("email or password is incorrect");
  
})


app.listen(3000)

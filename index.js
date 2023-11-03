const express = require("express")
const cors = require("cors")
const mysql = require("mysql2")
const dotenv = require("dotenv").config()
const validator = require("validator")
const bcrypt = require("bcrypt")
var nodemailer = require('nodemailer');
const db = require("./config/dbConfig.js");
const serverRoutes = require("./routes/serverRoutes.js");
const jwt = require("jsonwebtoken");
const { jwtDecode } = require('jwt-decode');
const common = require("./functions/common.js")

const app = express()
const port = process.env.PORT || 5001;

app.use(express.urlencoded({ extended: true }));
app.use(express.json())
app.use(cors())

app.use("/", serverRoutes);
app.use('/public', express.static('uploads/'));    // http://localhost:5000/public/download.jpg   // http://localhost:5000/public/563c1b31-2377-47fd-abcd-b6810c25943a.jpg



db.connect((err) => {
  if (err) {
    console.error('Error connecting to database: ' + err.stack);
    return;
  }
  console.log('Connected to database as ID ' + db.threadId);
});


app.get("/", async (req, res) => {
  const selectQuery = "SELECT * FROM users WHERE userID = ? limit 1";

  const result = await new Promise((resolve, reject) => {
    db.query(
      selectQuery, "57", (err, data) => {
        if (err) {
          reject({ success: false, error: err });
        }
        resolve(data);
      }
    );
  });

  return res.send(result);


})

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})






















// var jwtVerifyRetObj = jwt.verify("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7ImVtYWlsIjoia2V2YWxyYWJhZGl5YTkxcHJvbGlua0BnbWFpbC5jb20iLCJ1c2VySUQiOjU3fSwiaWF0IjoxNjk4ODE1MjQ1LCJleHAiOjE2OTg4MTg4NDV9.MVSMiLCFdSJWzWqxXe545HhF9mIn1dywI9TpTtLFNHo", process.env.SECRET_KEY)
// console.log(jwtVerifyRetObj)

// console.log("data.authenticated".split("."))
// console.log("authenticated".split("."))


// console.log(common.getProperty({
//     data: { email: 'kevalrabadiya91prolink@gmail.com', userID: 57 },
//     iat: 1698819872,
//     exp: 1698823472
//   }, "data.authenticated"));

// console.log(bcrypt.compareSync("user4abc$","$2b$10$Jz5IXTb4A3UbBJlIe5ea..3XxgorZQbWeTNzGj1yilFmERwjAy3cm"))

// console.log('$2b$10$Jz5IXTb4A3UbBJlIe5ea..3XxgorZQbWeTNzGj1yilFmERwjAy3cm' == '$2b$10$HPydUVi1VNV2oZQhoDiwluU7LYR2xti0Rk/teFBOFRVVoARMZ3rsS');



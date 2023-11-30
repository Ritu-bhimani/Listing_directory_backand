const mysql = require('mysql2');
const dotenv = require("dotenv").config();

const db = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "",
    database: "directory_listing2"
})

// const db = mysql.createConnection({
//     host: process.env.DB_HOST,
//     port: process.env.DB_PORT,
//     user: process.env.DB_USER,
//     password: process.env.DB_PSWD,
//     database: process.env.DB_NAME
// })

module.exports = db;


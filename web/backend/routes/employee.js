var express = require('express');
var router = express.Router();
var mysql = require('mysql');

/**
 * All employee related routes
 */
router.get("/", function (req, res) {
    res.send('This route is for all user related tasks');
});

/*
    Add employee to database. 
    Only use if you hire a new employee 
 */
router.post("/add-employee", (req, res) => {
    var con = mysql.createConnection({
        host: process.env.SQL_HOST,
        user: process.env.SQL_USER,
        password: process.env.SQL_PASSWORD,
        database: process.env.SQL_DATABASE,
    });
    con.connect(function (err) {
        if (err) {
            res.status(400).send({message: "Error: Connection to Database"})
            return
        }
        if(req.body.name == undefined || req.body.name == null){
            res.status(400).send({message: "Error: Invalid Name"})
            return
        }
        sqlQuery = "CREATE TABLE " + req.body.name + " (date varchar(20), class varchar(50), clinic varchar(50), hours float, privateLessonName varchar(50), privateLessonLength float, chitNumber int);"
        console.log(sqlQuery)
        con.query(sqlQuery, function (err, result) {
            if (err) {
                res.status(400).send({message: "Error: User already exists"})
                return
            }
            res.status(200).send({message: "Database Created for " + req.body.name})
        }); 
    });
});

/*
    Remove employee from database
    This will destroy all of their information
    Only use if employee is fired or leaves
*/
router.post("/remove-employee", (req, res) => {
    var con = mysql.createConnection({
        host: process.env.SQL_HOST,
        user: process.env.SQL_USER,
        password: process.env.SQL_PASSWORD,
        database: process.env.SQL_DATABASE,
    });
    con.connect(function (err) {
        if (err) {
            res.status(400).send({message: "Error: Error Connecting to Database"})
            return
        }
        if(req.body.name == undefined || req.body.name == null){
            res.status(400).send({message: "Error: Invalid Name"})
            return
        }
        sqlQuery = "DROP TABLE " + req.body.name  
        console.log(sqlQuery)
        con.query(sqlQuery, function (err, result) {
            if (err) {
                res.status(400).send({message: "Error: Error dropping, check that user exists"})
                return
            }
            res.status(200).send({message: req.body.name + " Removeed"})
        }); 
    });
})

module.exports = router


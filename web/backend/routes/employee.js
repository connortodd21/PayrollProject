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
    @param: Name    first name + last name (ex: JonDoe)
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
        var sqlQuery = "CREATE TABLE " + req.body.name + " (date varchar(20), clinic varchar(50), hours float, privateLessonName varchar(50), privateLessonLength float, chitNumber varchar(20));"
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
    @param: Name    first name + last name (ex: JonDoe)
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
        if(!req.body || !req.body.name){
            res.status(400).send({message: "Error: Bad Request"})
            return
        }
        var sqlQuery = "DROP TABLE " + req.body.name  
        con.query(sqlQuery, function (err, result) {
            if (err) {
                res.status(400).send({message: "Error: Error dropping, check that user exists"})
                return
            }
            res.status(200).send({message: req.body.name + " Removeed"})
        }); 
    });
})

/*
    Add group hours to table 
    What you need: name, date, class/clinic, hours
*/
router.post('/add-group', (req, res) => {
    var con = mysql.createConnection({
        host: process.env.SQL_HOST,
        user: process.env.SQL_USER,
        password: process.env.SQL_PASSWORD,
        database: process.env.SQL_DATABASE,
    });
    con.connect( (err) => {
        if (err) {
            res.status(400).send({message: "Error: Error Connecting to Database"})
            return
        }
        if(!req.body || !req.body.name || !req.body.group || !req.body.date || !req.body.hours){
            res.status(400).send({message: "Error: Bad Request"})
            return
        }
        //INSERT INTO ConnorTodd (date, clinic, hours) VALUES ('01/14/19', 'TX', 3);
        var sqlQuery = "INSERT INTO " + req.body.name + " (date, clinic, hours) VALUES (\'" + req.body.date + "\', \'" + req.body.group + "\', \'" + req.body.hours + "\');"
        con.query(sqlQuery, (err, result) => {
            if (err) {
                res.status(400).send({message: "Error: Error adding hours for group"})
                return
            }
            res.status(200).send({message: "Hours added for group"})
        })
    })
})

/*
    Add private lesson hours to table 
    What you need: name, date, private lesson, privateLessonLength, chit number
*/
router.post('/add-private', (req, res) => {
    var con = mysql.createConnection({
        host: process.env.SQL_HOST,
        user: process.env.SQL_USER,
        password: process.env.SQL_PASSWORD,
        database: process.env.SQL_DATABASE,
    });
    con.connect( (err) => {
        if (err) {
            res.status(400).send({message: "Error: Error Connecting to Database"})
            return
        }
        if(!req.body || !req.body.name || !req.body.lessonName || !req.body.date || !req.body.privateLessonLength, !req.body.chit){
            res.status(400).send({message: "Error: Bad Request"})
            return
        }
        //INSERT INTO ConnorTodd (date, clinic, hours) VALUES ('01/14/19', 'TX', 3);
        var sqlQuery = "INSERT INTO " + req.body.name + " (date, privateLessonName, privateLessonLength, chitNumber) VALUES (\'" + req.body.date + "\', \'" + req.body.lessonName + "\', \'" + req.body.privateLessonLength + "\', \'" + req.body.chit + "\');"
        con.query(sqlQuery, (err, result) => {
            if (err) {
                res.status(400).send(err)
                return
            }
            res.status(200).send({message: "Hours added for private lesson"})
        })
    })
})

/*
    Add route to calculate totals
*/

/*
    Add route to clear past entries
*/
module.exports = router


var express = require('express');
var router = express.Router();
var mysql = require('mysql');
const bcrypt = require('bcrypt');
var encrypt = require('../middleware/encrypt')

/**
 * All employee related routes
 */
router.get("/", function (req, res) {
    res.send('This route is for all user related tasks');
});

/*
    Register new employee
    Admin only function
    @params
    username: employee's username
    password: password for employee
    email: employee email
    _id: employee ID
*/
router.post("/register", (req, res) => {
    if(!req.body || !req.body.username || !req.body.password || !req.body.standing){
        res.status(400).send({message: "Error: Bad request"})
        return
    }
    if(req.body.standing != 'admin'){
        res.status(401).send({message: "Error: User is not an Admin"})
        return;
    }
    var con = mysql.createConnection({
        host: process.env.SQL_HOST,
        user: process.env.SQL_USER,
        password: process.env.SQL_PASSWORD,
        database: process.env.SQL_DATABASE,
    });
    con.connect( (err) => {
        if (err) {
            res.status(400).send({message: "Error: Connection to Database"})
            console.log(err)
            return
        }
        encrypt(req.body.password).then( (encryptedPassword) => {
            var sqlQuery = "INSERT INTO " + process.env.SQL_EMPLOYEES + " (username, password, standing) VALUES (\'" + req.body.username + "\', \'" + encryptedPassword + "\', \'" + req.body.standing + "\');"
            con.query(sqlQuery, (err, result) => {
                if (err) {
                    res.status(400).send(err)
                    return
                }
                res.status(200).send({message: "Employee registered!"})
            })
        })
    })
})

/*
    Login 
    @params
    username: username of employee
    password: password
    
    // Load hash from your password DB.
    bcrypt.compare(myPlaintextPassword, hash, function(err, res) {
        // res == true
    });
*/
router.post("/login", (req, res) => {
    if(!req.body || !req.body.username || !req.body.password){
        res.status(400).send({message: "Error: Bad request"})
        return
    }
    var con = mysql.createConnection({
        host: process.env.SQL_HOST,
        user: process.env.SQL_USER,
        password: process.env.SQL_PASSWORD,
        database: process.env.SQL_DATABASE,
    });
    con.connect( (err) => {
        if (err) {
            res.status(400).send({message: "Error: Connection to Database"})
            console.log(err)
            return
        }
        var sqlQuery = "SELECT * FROM " + process.env.SQL_EMPLOYEES + " where username=\'" + req.body.username + "\';"
        con.query(sqlQuery, (err, result) => {
            if (err) {
                res.status(400).send(err)
                return
            }
            var cipthertext = result[0].password
            bcrypt.compare(req.body.password, cipthertext, function(err, comp) {
                if(comp == false){
                    res.status(400).send({message: "Error: Username or Password is incorrect"})
                    return
                }
                req.session.user = result.dataValues
            });
            res.status(200).send({message: "User logged in"})
        }) 
    })    
})

/*
    Add employee to database. 
    Only use if you hire a new employee
    Admin only function 
    @params
    name: first name + last name (ex: JonDoe)
 */
router.post("/add-employee", (req, res) => {
    if(!req.body || !req.body.name || !req.body.standing){
        res.status(400).send({message: "Error: Bad Request"})
        return
    }
    if(req.body.standing != 'admin'){
        res.status(401).send({message: "Error: User is not an Admin"})
        return;
    }
    var con = mysql.createConnection({
        host: process.env.SQL_HOST,
        user: process.env.SQL_USER,
        password: process.env.SQL_PASSWORD,
        database: process.env.SQL_DATABASE,
    });
    con.connect(function (err) {
        if (err) {
            res.status(400).send({message: "Error: Connection to Database"})
            console.log(err)
            return
        }
        var sqlQuery = "CREATE TABLE " + req.body.name + " (date varchar(20), clinic varchar(50), hours float, leader int, privateLessonName varchar(50), privateLessonLength float, chitNumber varchar(20));"
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
    @params 
    name: first name + last name (ex: JonDoe)
*/
router.post("/remove-employee", (req, res) => {
    if(!req.body || !req.body.name){
        res.status(400).send({message: "Error: Bad Request"})
        return
    }
    var con = mysql.createConnection({
        host: process.env.SQL_HOST,
        user: process.env.SQL_USER,
        password: process.env.SQL_PASSWORD,
        database: process.env.SQL_DATABASE,
    });
    con.connect(function (err) {
        if (err) {
            res.status(400).send({message: "Error: Error Connecting to Database"})
            console.log(err)
            return
        }
        var sqlQuery = "DROP TABLE " + req.body.name  
        con.query(sqlQuery, function (err, result) {
            if (err) {
                res.status(400).send({message: "Error: Error dropping, check that user exists"})
                return
            }
            res.status(200).send({message: req.body.name + " Removed"})
        }); 
    });
})

/*
    Add a new private lesson to an employee
    @params
    name: first name + last name (ex: JonDoe)
    group: name of group/clinic
    date: date of group (MM/DD/YY)
    hours: length of group
*/
router.post('/add-group', (req, res) => {
    if(!req.body || !req.body.name || !req.body.group || !req.body.date || !req.body.hours || !req.body.leader){
        res.status(400).send({message: "Error: Bad Request"})
        return
    }
    var con = mysql.createConnection({
        host: process.env.SQL_HOST,
        user: process.env.SQL_USER,
        password: process.env.SQL_PASSWORD,
        database: process.env.SQL_DATABASE,
    });
    con.connect( (err) => {
        if (err) {
            res.status(400).send({message: "Error: Error Connecting to Database"})
            console.log(err)
            return
        }
        //INSERT INTO ConnorTodd (date, clinic, hours) VALUES ('01/14/19', 'TX', 3);
        var sqlQuery = "INSERT INTO " + req.body.name + " (date, clinic, hours, leader) VALUES (\'" + req.body.date + "\', \'" + req.body.group + "\', \'" + req.body.hours + "\', \'" + req.body.leader + "\');"
        con.query(sqlQuery, (err, result) => {
            if (err) {
                res.status(400).send(err)
                return
            }
            res.status(200).send({message: "Hours added for " + req.body.group})
        })
    })
})

/*
    Add a new private lesson to an employee
    @params
    name: first name + last name (ex: JonDoe)
    lessonName: last name of person recieving private lesson
    date: date of lesson (MM/DD/YY)
    privateLessonLength: length of private lesson in hours
    chit: chit number
*/
router.post('/add-private', (req, res) => {
    if(!req.body || !req.body.name || !req.body.lessonName || !req.body.date || !req.body.privateLessonLength, !req.body.chit){
        res.status(400).send({message: "Error: Bad Request"})
        return
    }
    var con = mysql.createConnection({
        host: process.env.SQL_HOST,
        user: process.env.SQL_USER,
        password: process.env.SQL_PASSWORD,
        database: process.env.SQL_DATABASE,
    });
    con.connect( (err) => {
        if (err) {
            res.status(400).send({message: "Error: Error Connecting to Database"})
            console.log(err)
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
    Route to calculate total hours for group lessons
    @params
    name: first name + last name (ex: JonDoe) 
*/
router.get('/group-count', (req, res) => {
    if(!req.body || !req.body.name){
        res.status(400).send({message: "Error: Bad Request"})
        return
    }
    var con = mysql.createConnection({
        host: process.env.SQL_HOST,
        user: process.env.SQL_USER,
        password: process.env.SQL_PASSWORD,
        database: process.env.SQL_DATABASE,
    });
    con.connect( (err) => {
        if (err) {
            res.status(400).send({message: "Error: Error Connecting to Database"})
            console.log(err)
            return
        }
        var sqlQuery = "SELECT SUM(hours) FROM " + req.headers.name
        con.query(sqlQuery, (err, result) => {
            if (err) {
                res.status(400).send(err)
                return
            }
            var ret = {
                hours: result[0]['SUM(hours)']
            }
            res.status(200).send(ret)
        }) 
    })
})

/*
    Route to calculate total hours for private lessons
    @params
    name: first name + last name (ex: JonDoe) 
*/
router.get('/private-count', (req, res) => {
    if(!req.body || !req.body.name){
        res.status(400).send({message: "Error: Bad Request"})
        return
    }
    var con = mysql.createConnection({
        host: process.env.SQL_HOST,
        user: process.env.SQL_USER,
        password: process.env.SQL_PASSWORD,
        database: process.env.SQL_DATABASE,
    });
    con.connect( (err) => {
        if (err) {
            res.status(400).send({message: "Error: Error Connecting to Database"})
            console.log(err)
            return
        }
        var sqlQuery = "SELECT SUM(privateLessonLength) FROM " + req.headers.name
        con.query(sqlQuery, (err, result) => {
            if (err) {
                res.status(400).send(err)
                return
            }
            var ret = {
                hours: result[0]['SUM(privateLessonLength)']
            }
            res.status(200).send(ret)
        }) 
    })
})

/*
    Get table of payroll for an employee
    @params
    name: first name + last name (ex: JonDoe)
*/
router.get("/all-hours", (req, res) => {
    if(!req.headers.name){
        res.status(400).send({message: "Error: Bad Request"})
        return
    }
    var con = mysql.createConnection({
        host: process.env.SQL_HOST,
        user: process.env.SQL_USER,
        password: process.env.SQL_PASSWORD,
        database: process.env.SQL_DATABASE,
    });
    con.connect( (err) => {
        if (err) {
            res.status(400).send({message: "Error: Error Connecting to Database"})
            console.log(err)
            return
        }
        var sqlQuery = "SELECT * FROM " + req.headers.name
        con.query(sqlQuery, (err, result) => {
            if (err) {
                res.status(400).send(err)
                return
            }
            res.status(200).send(result)
        }) 
    })
})

/*
    Clear past entries
*/
module.exports = router


const express = require ('express');
let cookieParser = require('cookie-parser');
var cors = require('cors');
require('dotenv').config();

/* Routes */
let admin = require('./routes/admin.js')
let employee = require('./routes/employee.js')

const app = express(cors());

/* Parsers */
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Authorization, token, Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Expose-Headers", "token");
    res.header('Access-Control-Allow-Credentials', 'true');
    next();
});

/* Routes */
// app.use('/admin', admin);
app.use('/employee', employee)

app.get('/', (res, req) => {
});

app.listen(process.env.PORT, () => {
    console.log('The application is running on localhost:' + process.env.PORT)
    
});
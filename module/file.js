var
    express = require("express"),
    mysql = require('mysql'),
    // router = require('./route/route.js'),
    bodyParser = require("body-parser"),
    fs = require('fs'),
    path = require("path");

var app = express();

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456',
    // port: '3306',
    database: 'mydatabase'
});

var data = {};

connection.connect();

module.exports.data = data;

module.exports.LoginYanzgeng = function (req, res) {
    var that = this;
    var username = req.body.username;
    var pwd = req.body.password;
    var istrue = false;
    connection.query("SELECT * FROM userinfo", function (err, result) {
        if (err) {
            return;
        }
        for (const key in result) {
            if (result[key].username == username && result[key].password == pwd) {
                data.username = username;
                istrue = true;
                app.get('/username', function (req, res) {
                    res.json(data.username);
                })
                break;
            }
        }
        if (istrue) {
            fs.readFile("./public/home.html", function (err, data) {
                if (err) {
                    throw err;
                }
                res.end(data + "<div class='user'>" + username + "<div>");
            })
        } else {
            res.setHeader("refresh", "3;/");
            res.end("<p>password or username is error,back to login page a few seconds later</p>");
        }
    });

}
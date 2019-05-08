var
    express = require("express"),
    mysql = require('mysql'),
    router = require('./route/route.js'),
    bodyParser = require("body-parser"),
    mysql_way = require("./module/mysql_way.js"),
    fs = require('fs'),
    path = require("path"),
    querystring = require('querystring'),
    url = require('url'),
    formidable = require('formidable'),
    util = require('util');


var app = express();

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456',
    port: '3306',
    database: 'mydatabase'
});

var data = {};

connection.connect(function (e) {
    if (e) {
        console.log(e.stack);
        return;
    }
});

//设置跨域访问
app.all('*', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type,Content-Length, Authorization, Accept,X-Requested-With");
    res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By", ' 3.2.1')
    next();
});

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, "./public")));
app.use(express.static(__dirname + "./public"));
app.use('/upload', express.static(path.join(__dirname, "./upload")));
app.use(bodyParser.urlencoded({ extended: false }));
// 首页
// 是否在登录的情况下进入主界面，注释后为需要登录才能进入；
app.get("/", router.showIndex);
app.get("/index", router.showIndex);
app.get("/regist", router.showRegist);
app.get("/login", router.showLogin);
app.get("/mine", router.showMine);
app.get('/login', function (req, res) {
    data = {};
})
app.get('/', function (req, res) {
    data = {};
})
// 验证用户名和密码
app.post('/index', function (req, res) {
    var that = this;
    var username = req.body.username;
    var pwd = req.body.password;
    var istrue = false;
    connection.query("SELECT * FROM userinfos", function (err, result) {
        if (err) {
            return;
        }
        for (const key in result) {
            if (result[key].username == username && result[key].password == pwd) {
                data.username = username;
                istrue = true;
                app.get('/username', function (req, res) {
                    res.setHeader("refresh", "0;/index");
                    res.json(data.username);
                    data = {};
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
            res.setHeader("refresh", "3;/login");
            res.end("<p>password or username is error,back to login page a few seconds later</p>");
        }
    });

})

// 注册
app.post("/login", function (req, res) {
    var username = req.body.username;
    var pwd = req.body.password;
    var repwd = req.body.repassword;
    var istrue = false;
    if (pwd == repwd) {
        connection.query("SELECT * FROM userinfos", function (err, result) {
            if (err) {
                return;
            }
            console.log(username)
            for (var i = 0; i < result.length; i++) {
                if (result[i].username == username) {
                    console.log(result[i].username)
                    istrue = true;
                    break;
                }
            }
            if (istrue) {
                fs.readFile("./public/regist.html", function (err, data) {
                    if (err) {
                        throw err;
                    }
                    res.setHeader("refresh", "0;/regist");
                    res.end(data + "<script>alert('用户名已存在')</script>");
                })
            } else {
                var addSql = 'INSERT INTO userinfos(username,password) VALUES(?,?)';
                var addSqlParams = [username, pwd];
                //增
                connection.query(addSql, addSqlParams, function (err, result) {
                    if (err) {
                        console.log('[INSERT ERROR] - ', err.message);
                        return;
                    }

                    console.log('--------------------------INSERT----------------------------');
                    //console.log('INSERT ID:',result.insertId);        
                    console.log('INSERT ID:', result);
                    console.log('-----------------------------------------------------------------\n\n');
                });
                fs.readFile("./public/login.html", function (err, data) {
                    if (err) {
                        throw err;
                    }
                    res.end(data);
                })
            }
        });
    } else {
        fs.readFile("./public/regist.html", function (err, data) {
            if (err) {
                throw err;
            }
            console.log("login1")
            res.end(data + "<p>密码不一致</p>");
        })
    }

})

// 创建商店
app.post("/creatshop", function (req, res) {
    var username = req.body.username;
    var shopname = req.body.shopname;
    console.log(username, shopname, req.body)
    var istrue = false;
    connection.query("SELECT * FROM creatshop", function (err, result) {
        if (err) {
            return;
        }
        for (var i = 0; i < result.length; i++) {
            if (result[i].username == username) {
                data.shopname = shopname;
                console.log(data, '157')
                app.get('/shop', function (req, res) {
                    res.json(data);
                })
                istrue = true;
                break;
            }
        }
        if (istrue) {
            fs.readFile("./public/creatshop.html", function (err, data) {
                if (err) {
                    throw err;
                }
                res.setHeader("refresh", "3;/myshop.html");
                res.end("<h1>Creat shop error, maybe you have your own shop!</h1>");
            })
        } else {
            var addSql = 'INSERT INTO creatshop(shopname,username) VALUES(?,?)';
            var addSqlParams = [shopname, username];
            //增
            connection.query(addSql, addSqlParams, function (err, result) {
                if (err) {
                    console.log('[INSERT ERROR] - ', err.message);
                    return;
                }

                console.log('--------------------------INSERT----------------------------');
                //console.log('INSERT ID:',result.insertId);        
                console.log('INSERT ID:', result);
                console.log('-----------------------------------------------------------------\n\n');
            });
            res.setHeader("refresh", "0;/myshop.html");
            res.end();

        }
    })
});
// 获取商店名
app.use('/shop', function (req, res) {
    data.username = req.body.username;
    connection.query("SELECT * FROM creatshop", function (err, result) {
        if (err) {
            return;
        }
        for (var i = 0; i < result.length; i++) {
            if (result[i].username == data.username) {
                data.shopname = result[i].shopname;
                istrue = true;
                break;
            }
        }
        res.json(data);
    })
})

// 上架商品
app.post("/shangjia", function (req, res, next) {
    // 设置保存路径
    var form = new formidable.IncomingForm();
    //设置编辑
    form.encoding = 'utf-8';
    //设置文件存储路径
    form.uploadDir = "./upload/";
    //保留后缀
    form.keepExtensions = true;
    //设置单文件大小限制
    // form.maxFieldsSize = 2 * 1024 * 1024;
    form.parse(req, (err, fields, files) => {
        if (err) {
            throw err;
        }
        var t = (new Date()).getTime();
        //生成随机数
        var ran = parseInt(Math.random() * 8999 + 10000);
        //拿到扩展名
        var extname = path.extname(files.tradeimg.name);

        //path.normalize('./path//upload/data/../file/./123.jpg'); 规范格式文件名
        var oldpath = path.normalize(files.tradeimg.path);

        //新的路径
        let newfilename = t + ran + extname;
        var newpath = "./upload/" + fields.username + '/' + newfilename;
        var saveData = {
            'tradename': fields.tradename,
            'price': fields.tradeprice,
            'tradeinfo': fields.tradeinfo,
            'tradeimg': newpath,
            'username': fields.username,
            'shopname': fields.shopname
        };
        // form.uploadDir = __dirname + "/upload/" + saveData.username;
        fs.exists("./upload/" + saveData.username, function (exists) {
            if (!exists && saveData.username != undefined) {
                fs.mkdir('./upload/' + saveData.username, { recursive: true }, function (err) {
                    if (err) {
                        return console.error(err, "目录新建失败");
                    }
                    console.log("目录创建成功。");
                });
            } else {
                return;
            }
        });
        mysql_way.insertData('trade', saveData, function (e, r) {
            if (e) {
                res.status(200).json({ "status": false, "msg": e, "data": [] });
            }
            res.end("<script>alert('Successful on the shelf')</script>")
        })

        fs.rename(oldpath, newpath, function (err) {
            if (err) {
                console.error("改名失败" + err);
            }
        });

        res.setHeader("refresh", "0;/shangjia.html");
    });
})
// 展示商品
app.post('/myshop_one.html', function (req, res) {
    var sql = "select * from trade where username='" + req.body.username + "'";
    mysql_way.selectAll(sql, function (e, r) {
        res.status(200).json(r);
    })
})
// 下架商品
app.post('/xiajia', function (req, res) {
    var deleteID = { id: req.body.id };
    mysql_way.deleteData("trade", deleteID, function (e, r) { })
})

// 获取商店信息并展示
app.get('/showshop', function (req, res) {
    var sql = "select * from creatshop";
    mysql_way.selectAll(sql, function (e, r) {
        res.status(200).json(r);
    })
})

// 展示每个商店内的商品信息
app.post('/showtrade', function (req, res) {
    var sql = "select * from trade where username='" + req.body.username + "'";
    mysql_way.selectAll(sql, function (e, r) {
        res.status(200).json(r);
    })
})

// 购物车
app.post('/gouwuche', function (req, res) {
    var saveData = {
        tradename: req.body.tradename,
        price: req.body.price,
        num: req.body.num,
        username: req.body.username
    }
    var sql = "select * from gouwuche where username='" + req.body.username + "'";
    mysql_way.insertData('gouwuche', saveData, function (e, r) {
        mysql_way.selectAll(sql, function (e, r) {
            res.status(200).json(r);
        })
    })
})
app.get('/gouwuche_select', function (req, res) {
    var sql = "select * from gouwuche where username='" + req.query.username + "'";
    mysql_way.selectAll(sql, function (e, r) {
        res.status(200).json(r);
    })
})
app.get('/gouwuche_ok', function (req, res) {
    var _set = { num: req.query.num };
    var _where = { id: req.query.id };
    mysql_way.updateData('gouwuche', _set, _where, function (e, r) {
        res.status(200).json(r);
    })
})
app.post("/gouwuche_del", function (req, res) {
    var deleteID = { id: req.body.id };
    mysql_way.deleteData("gouwuche", deleteID, function (e, r) {
        if (e) {
            res.status(200).json({ "res_code": 0 });
        } else {
            res.status(200).json({ "res_code": 1 });
        }
    })
})


app.listen(3000);
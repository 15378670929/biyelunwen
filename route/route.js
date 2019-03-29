var fs = require("fs")

module.exports.showLogin = function(req,res,next){
    fs.readFile("./public/login.html",function(err,data){
        if(err){
            next();
		}
		res.end(data);
    });
    
}
module.exports.showIndex = function(req,res,next){
    fs.readFile("./public/home.html",function(err,data){
        if(err){
			next();
		}
		res.end(data);
    })
}
module.exports.showRegist = function(req,res,next){
    fs.readFile("./public/regist.html",function(err,data){
        if(err){
			next();
		}
		res.end(data);
    })
}
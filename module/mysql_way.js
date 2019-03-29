
var mysql = require('mysql');

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456',
    // port: '3306',
    database: 'mydatabase'
});
var connectiond = connection;

// 查询所有数据
var selectAll = function (sql, callback) {
    connectiond.query(sql, function (err, result) {
        if (err) {
            console.log("错误信息：", err.sqlMessage);
            let errNews = err.sqlMessage;
            callback(errNews, 'errnews');
            return;
        }
        var string = JSON.stringify(result);
        var data = JSON.parse(string);
        callback('data', data);
    })
}

// 插入一条数据
var insertData = function (table, datas, callback) {
    var fields = '';
    var values = '';
    for (var k in datas) {
        fields += k + ',';
        values = values + "'" + datas[k] + "',";
    }
    fields = fields.slice(0, -1);
    values = values.slice(0, -1);
    console.log(fields, values);
    var sql = "INSERT INTO " + table + ' (' + fields + ') VALUES (' + values + ')';
    connectiond.query(sql, callback);
}

// 更新数据
var updateData = function (table, sets, where, callback) {
    var _SETS = '';
    var _where = '';
    var keys = '';
    var values = '';
    for (var k in sets) {
        _SETS += k + "='" + sets[k] + "',";
    }
    _SETS = _SETS.slice(0, -1);
    for (var k2 in where) {
        _where += k2 + "=" + where[k2];
    }
    var sql = "UPDATE " + table + " SET " + _SETS + " WHERE " + _where;
    connectiond.query(sql, callback);
}

// 删除数据
var deleteData = function (table, where, callback) {
    var _WHERE = '';
    for (var k2 in where) {
        // 多个筛选条件 _WHERE += k2 + "=" + where[k2] + "AND"
        _WHERE += k2 + "=" + where[k2]
    }
    var sql = "DELETE FROM " + table + " WHERE " + _WHERE;
    connectiond.query(sql, callback);
}
module.exports.selectAll = selectAll;
module.exports.insertData = insertData;
module.exports.updateData = updateData;
module.exports.deleteData = deleteData;
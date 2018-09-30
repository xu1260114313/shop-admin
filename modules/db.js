const mongodb = require('mongodb');
const MongodbClient = mongodb.MongoClient;
const ObjectID = mongodb.ObjectID;
const Dburl = "mongodb://localhost:27017";
const dbName = "productmanage";

function __connectDb(callback) {
    MongodbClient.connect(Dburl, (err, client) => {
        if(err) {
            console.log('数据库连接失败');
            return;
        }
        //进行操作
        const db = client.db(dbName);
        callback(client, db);
    })
}

exports.ObjectID = ObjectID;

//查询数据
exports.find = function(collectionName, opts, callback) {
    __connectDb((client, db) => {
       const result = db.collection(collectionName).find(opts);
       result.toArray((error, docs) => {
           client.close();
           callback(error, docs); //发送结果数据
       })
    })
}

//增加数据
exports.insert = function(collectionName, json, callback) {
    __connectDb((client, db) => {
       db.collection(collectionName).insertOne(json, (error, data) => {
           client.close();
           callback(error, data);
       })
    })
}

//修改数据
exports.update = function(collectionName, json1, json2, callback) {
    __connectDb((client, db) => {
       db.collection(collectionName).updateOne(json1, { $set: json2 }, (error, data) => {
            client.close();
            callback(error, data);
       })
    })
}

//删除数据
exports.delete = function(collectionName, json, callback) {
    __connectDb((client, db) => {
       db.collection(collectionName).deleteOne(json, (error, data) => {
            client.close();
            callback(error, data);
       })
    })
}
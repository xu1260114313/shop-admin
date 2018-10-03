const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const session = require('express-session');
const md5 = require('md5-node');
const DB = require('./modules/db.js'); //数据库操作
const multiparty = require('multiparty'); //可以上传图片和数据
const fs = require('fs');


app.use(session({
    secret: "keycode",
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 1000 * 60 * 30
    },
    rolling: true
}))


//设置body-parser(form提交方式)
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

//ejs模板引擎
app.set('view engine', 'ejs');
app.use(express.static(__dirname + "/public"));
app.use("/upload", express.static(__dirname + "/upload"));

//自定义中间件，判断登陆状态
app.use((req, res, next) => {
    
    if(req.url === "/login" || req.url === "/doLogin") {
        next();
    }else {
        const { userInfo } = req.session;
        if(userInfo && userInfo.name != '') {
            app.locals['userInfo'] = userInfo; //配置全局信息
            next();
        }else {
            res.redirect('/login');
        }
    }
})

app.get('/', (req, res) => {
    res.send('index');
});

//登陆
app.get('/login', (req, res) => {
    res.render("login");
})
//获取提交的数据
app.post('/doLogin', (req, res) => {
    // 1.获取数据
    const password = md5(req.body.password);
    DB.find('user', {"name": req.body.username, password}, (err, data) => {
        if(data.length > 0) {
            //保存用户信息
            req.session.userInfo = data[0];
            res.redirect('/product');
        }else {
            res.send('<script>alert("登陆失败");window.location.href="/login";</script>')
        };
    })
})


//商品列表
app.get('/product', (req, res) => {
    const uid = req.session.userInfo["_id"];
    //连接数据库查询数据
    DB.find('product', {uid: DB.ObjectID(uid)}, (err, data) => {
        res.render("product", {
            list: data
        });
    })
})

//增加商品
app.get('/productadd', (req, res) => {
    res.render("productadd");
})
app.post('/doProductAdd', (req, res) => {
    const uid = req.session.userInfo["_id"];
    //获取表单数据
    const form = new multiparty.Form();
    form.uploadDir = "upload"; //上传的文件夹名称
    form.parse(req, (err, fields, files) => {
        const { title, price, fee, description } = fields;
        const pic = files.pic[0].path;
        
        DB.insert('product', {
            uid: DB.ObjectID(uid),
            title: title[0] || null,
            price: price[0] || 0,
            fee: fee[0] || 0,
            description: description[0] || null,
            pic: pic
        }, (err, data) => {
            if(!err) {
                res.redirect('/product'); //上传成功
            }
        })
    })
})

//修改商品
app.get('/productedit', (req, res) => {
    //获取参数
    const id = req.query["id"];
    const uid = req.session.userInfo["_id"];
    //去数据库获取对应的数据
    DB.find('product', {_id: DB.ObjectID(id), uid: DB.ObjectID(uid)}, (err, data) => {
        res.render("productedit", {
            list: data[0]
        });
    })
})
app.post('/doProductEdit', (req, res) => {
    const form = new multiparty.Form();
    form.uploadDir = "upload"; //上传的文件夹名称
    form.parse(req, (err, fields, files) => {
        const _id = fields['_id'][0];
        const uid = req.session.userInfo["_id"];
        const { title, price, fee, description } = fields;
        const originalFilename = files.pic[0].originalFilename;
        const pic = files.pic[0].path;
        let setOpts = null;
        if(!!originalFilename) {
            setOpts = {
                uid: DB.ObjectID(uid),
                title: title[0] || null,
                price: price[0] || 0,
                fee: fee[0] || 0,
                description: description[0] || null,
                pic: pic
            };
        }else {
            setOpts = {
                title: title[0] || null,
                price: price[0] || 0,
                fee: fee[0] || 0,
                description: description[0] || null
            };

            //删除临时图片
            fs.unlinkSync(__dirname + "/" + pic);
        }


        DB.update('product', {
            "_id": DB.ObjectID(_id),
            "uid": DB.ObjectID(uid)
        }, setOpts, (err, data) => {
            if(!err) {
                res.redirect('/product');
            }
        })
    })
})

   
//删除商品

app.get('/logout', (req, res) => {
    //销毁session
    req.session.destroy(err => {
        if(err) {
            console.log(err);
            return;
        }
        res.redirect('/login');
    })
})

app.get('/productdelete', (req, res) => {
    const uid = req.session.userInfo['_id'];
    const id = req.query["id"];
    DB.delete('product', {uid: DB.ObjectID(uid), "_id": DB.ObjectID(id)}, (err, data) => {
        if(err){
            console.log(err);
            return;
        }
        res.redirect('/product');
    })
})
app.listen(3000, err => {
    if(err) {
        console.log(err);
        return;
    }
    console.log(`localhost:3000`);
});


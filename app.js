const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const session = require('express-session');
const md5 = require('md5-node');
const DB = require('./modules/db.js'); //数据库操作

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
    const _id = req.session.userInfo["_id"];
    //连接数据库查询数据
    DB.find('product', {uid: DB.ObjectID(_id)}, (err, data) => {
        res.render("product", {
            list: data
        });
    })
})

//增加商品
app.get('/productadd', (req, res) => {
    res.render("productadd");
})

//修改商品
app.get('/productedit', (req, res) => {
    res.render("productedit");
})

//删除商品
app.get('/productdelete', (req, res) => {
    res.send("productdelete");
})

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

app.get('/delete', (req, res) => {
    const _id = req.session.userInfo['_id'];
    DB.delete('product', {uid: DB.ObjectID(_id), title: "iphone4"}, (err, data) => {
        if(err){
            console.log(err);
            return;
        }
        res.send('删除成功！');
    })
})
app.listen(3000);


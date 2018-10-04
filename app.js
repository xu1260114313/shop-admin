const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const session = require('express-session');
const DB = require('./modules/db.js'); //数据库操作
const routes = require('./routes');

app.use(session({
    secret: "keycode",
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 1000 * 60 * 30
    },
    rolling: true
}));

//设置body-parser(form提交方式)
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

//ejs模板引擎
app.set('view engine', 'ejs');
app.use(express.static(__dirname + "/public"));
app.use("/upload", express.static(__dirname + "/upload"));

//自定义中间件，判断登陆状态
app.use((req, res, next) => {
    
    if(req.url === "/login" || req.url === "/doLogin" || req.url === "/register" || req.url === "/doRegister") {
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
routes(app, DB);

// module.exports = app;

const PORT =  process.env.PORT || 3000;

app.listen(PORT, err => {
    if(err) {
        console.log(err);
        return;
    }
    console.log(`Server name: http://localhost:${PORT}`);
});
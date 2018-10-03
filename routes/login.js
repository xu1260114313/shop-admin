const md5 = require('md5-node');

module.exports = (app, DB) => {
    //登陆
    app.get('/login', (req, res) => {
        res.render("login");
    });
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

    //登出
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
}
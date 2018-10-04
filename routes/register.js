const md5 = require('md5-node');

module.exports = (app, DB) => {
    //登陆
    app.get('/register', (req, res) => {
        res.render("register");
    });
    app.post('/doRegister', (req, res) => {
        // 1.获取数据
        const password = md5(req.body.password);
        const name = req.body.username;
        DB.find('user', {name}, (err, getData) => {
            if(getData.length > 0) {
                res.send('<script>alert("注册失败,用户名存在");window.location.href="/register";</script>');
            }else {
                DB.insert('user', {name , password}, (err, data) => {
                    if(!!data.result.n && !!data.result.ok) {
                        res.redirect('/login');
                    }else {
                         res.send('<script>alert("注册失败");window.location.href="/register";</script>')
                    }
                })
            };
        })
    })
}
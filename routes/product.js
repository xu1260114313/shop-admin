const multiparty = require('multiparty'); //可以上传图片和数据
const fs = require('fs');
const path = require('path');
module.exports = (app, DB) => {
    //首页
    app.get('/', (req, res) => {
        res.redirect('/product');
    });

    //商品列表
    app.get('/product', (req, res) => {
        const uid = req.session.userInfo["_id"];
        //连接数据库查询数据
        DB.find('product', { uid: DB.ObjectID(uid) }, (err, data) => {
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
        //检测文件夹是否存在，不存在则创建
        fs.stat(path.join(__dirname, '..', 'upload'), (err, status) => {
            if (!status) { //目录不存在
                fs.mkdirSync(path.join(__dirname, '..', 'upload'));
            };
            //获取表单数据
            let form = new multiparty.Form();
            form.uploadDir = "upload"; //上传的文件夹名称
            form.parse(req, (err, fields, files) => {
                const { title, price, fee, description } = fields;
                const pic = files.pic[0].path;

                DB.insert('product', {
                    uid: DB.ObjectID(uid),
                    title: title[0] || null,
                    price: Number(price[0]) || 0,
                    fee: Number(fee[0]) || 0,
                    description: description[0] || null,
                    pic: pic
                }, (err, data) => {
                    if (!err) {
                        res.redirect('/product'); //上传成功
                    }
                })
            })
        });
        
    })

    //修改商品
    app.get('/productedit', (req, res) => {
        //获取参数
        const id = req.query["id"];
        const uid = req.session.userInfo["_id"];
        //去数据库获取对应的数据
        DB.find('product', { _id: DB.ObjectID(id), uid: DB.ObjectID(uid) }, (err, data) => {
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
            if (!!originalFilename) {
                setOpts = {
                    uid: DB.ObjectID(uid),
                    title: title[0] || null,
                    price: Number(price[0]) || 0,
                    fee: Number(fee[0]) || 0,
                    description: description[0] || null,
                    pic: pic
                };
            } else {
                setOpts = {
                    title: title[0] || null,
                    price: Number(price[0]) || 0,
                    fee: Number(fee[0]) || 0,
                    description: description[0] || null
                };

                //删除临时图片
                fs.unlinkSync(path.join(__dirname, '..' , pic));
            }


            DB.update('product', {
                "_id": DB.ObjectID(_id),
                "uid": DB.ObjectID(uid)
            }, setOpts, (err, data) => {
                if (!err) {
                    res.redirect('/product');
                }
            })
        })
    })

    //删除商品
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
}
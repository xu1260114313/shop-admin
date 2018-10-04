module.exports = (app, DB) => {
    require('./login.js')(app, DB);
    require('./product.js')(app, DB);
    require('./register')(app, DB);
}
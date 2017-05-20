module.exports = function(path){
const db = require('./module/db.js').init();
const $ = require('jquery-deferred');
console.log('hello!start initializing csvviewerplus...');
  db.serialize(function () {
    let init = require('./module/init.js');
    init(db,path);
  });
};

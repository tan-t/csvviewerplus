const fs = require('fs');
const byline = require('byline')
const path = require('path');
const csv = require('csvtojson');
const $ = require('jquery-deferred');
const sqlBuilder = require('./sqlbuilder.js');
const when = require('when');

module.exports = function(db,folder){
  var defer = $.Deferred();
  fs.readdir(folder, function(err, files){
    if (err) throw err;
    var fileList = [];
    var csvList = files
    .map(file=>path.join(folder,file))
    .filter(function(file){
      return fs.statSync(file).isFile() && /.*\.csv$/.test(file);
    });
    var defers = csvList.map(c=>$.Deferred());
    csvList.forEach((file,inx)=>{
      createOne(db,file).then(function(){
        console.log('insert all resolved');
        defers[inx].resolve();
      });
    });
    when.all(defers.map(d=>d.promise())).then(function(){
      defer.resolve();
    })
  });
  return defer.promise();
}

var createOne = function(db,file){
  let fileName = file.split('\\').pop().split('.')[0];
  let insert;
  var defer = $.Deferred();

  var insDefers = [];
  var allResolved = $.Deferred();

  var firstRowStream = fs.createReadStream(file,{ encoding: 'utf8' });
  var bylineStream = byline(firstRowStream);

  bylineStream.on('data',function(line){
    var create = sqlBuilder.create(fileName).columnsNone(line.split(',')).build();
    db.run(create,function(){defer.resolve();});
    firstRowStream.destroy();
  });

  defer.promise().then(function(){
    csv().fromFile(file).on('json',(row)=>{
      if(!insert){
        insert = sqlBuilder.insert(fileName).columnsObj(row).build();
      }
      var param = {};
      for(p in row){
        param['$' + p] = row[p];
      }
      var insDefer = $.Deferred();
      db.run(insert,param,function(){
        insDefer.resolve();
      });
      insDefers.push(insDefer.promise());
    }).on('done',(err)=>{
      console.log('loaded ' + file);
      when.all(insDefers).then(function(){
        allResolved.resolve();
      });
    });
  });
  return allResolved.promise();
}

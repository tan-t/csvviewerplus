const extend = require('extend');
module.exports.create = function(tableName){
  return new Create(tableName);
}

Create = function(tableName){
  this.tableName_ = tableName;
  this.columns_ = [];
}

Create.prototype.columns = function(columns){
  this.columns_ = columns;
  return this;
}

Create.prototype.columnsNone = function(columns){
  this.columns(columns.map(s=>{return {name:s,type:'NONE'};}));
  return this;
}


Create.prototype.columnsObj = function(columnsObj){
  var columns = [];
  for(p in columnsObj){
    columns.push({name:p,type:'NONE'});
  }
  return this.columns(columns);
}

Create.prototype.build = function(){
  return ['create table if not exists',this.tableName_.toUpperCase(),'(',this.columns_.map(c=>c.name + ' ' + c.type).join(', '),')'].join(' ');
}

module.exports.insert = function(tableName){
  return new Insert(tableName);
}

Insert = function(tableName){
  this.tableName_ = tableName;
}

extend(true,Insert.prototype,Create.prototype);

Insert.prototype.build = function(){
  return ['insert or ignore into',this.tableName_.toUpperCase(),'(',this.columns_.map(c=>c.name).join(','),')','values','(',this.columns_.map(c=>'$'+c.name).join(','),')'].join(' ');
}

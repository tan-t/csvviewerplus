const sqlite3 = require('sqlite3');
const fs = require('fs');
const hash = require('object-hash');
const path = require('path');

module.exports.init = function(){
  // create db file
  console.log('creating new .sqlite file...');
  var outputFile = hash(new Date) + '.sqlite';
  console.log('filename is:' + outputFile);
  console.log('start connecting to db');
  return new sqlite3.Database(/*':memory:');*/path.join('./',outputFile));
};

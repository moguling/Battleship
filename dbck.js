const mysql = require('mysql');


var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'buylists'
});

connection.connect(function(error) {
  if (!!error) {
    console.log('Error');
  } else {
    console.log('Connected');
  }
})

module.exports = connection;

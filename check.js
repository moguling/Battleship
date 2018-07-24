const rp = require('request-promise');
const cheerio = require('cheerio');
const fs = require('fs');
const leftpad = require('left-pad');
const mysql = require('mysql');
const express = require('express');





function Battleship() {

      var connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'psa'
      });

      connection.connect(function(error) {
        if(!!error) {
          console.log('Error');
        } else {
          console.log('Connected');
        }
      })


for (let x = 0; x < 100; x++) {
                        //*******FIND MISSING IN RANGE J-JE***********
      let getsql = 'SELECT COUNT(Distinct Field1) AS count FROM psa.psa WHERE Field1 BETWEEN '+(x*1000000)+' AND '+((x+1)*1000000)+';';
      let getquery = connection.query(getsql, (err, result) => {
        if(err) {console.log(8888)};
        console.log(x*1000000+' | '+(x+1)*1000000+' | '+result[0].count);

      });
    };
};

Battleship();

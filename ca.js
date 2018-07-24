const rp = require('request-promise');
const cheerio = require('cheerio');
const fs = require('fs');
const leftpad = require('left-pad');
const express = require('express');
const db = require('./dbca');
var parse = require('csv-parse');
var obj = {};
var caData = [];

fs.readFile('/Users/andrewray/Downloads/Battleship - Copy/ca-7-18.csv', function (err, data) {
  if (err) throw err;
  parse(data, {columns: true, trim: true}, function(err, rows){

    for (var row in rows) {
      var post = {
      "Vendor": 'Card Advantage',
      "Set": rows[row]["Set"],
      "Name": rows[row]["Title"],
      "Style": 'Non-Foil',
      "Language": 'English',
      "NM_cash": rows[row]["Buylist"],
      "NM_trade": rows[row]["Buylist"],
      "NM_quantity": '100'
    }

    let sql = 'INSERT INTO buylists.cardadvantage SET ?';
    let query = db.query(sql, post, (err, result) => {
      if (err) {
        console.log(9999)
      };
    });

    //caData.push(newObj);
    }
    //console.log(caData);
    //console.log(rows);
  })
});

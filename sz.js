const rp = require('request-promise');
const cheerio = require('cheerio');
const fs = require('fs');
const leftpad = require('left-pad');
const express = require('express');
const db = require('./db');
//var parse = require('csv-parse');


fs.readFile('C:/Users/Andy/Desktop/Battleship/Strikezonebuylist.txt', 'utf8', function (err, data) {
  if (err) throw err;
    var lists = data.split('\n');
    var totalArr = [];

    for (var list in lists) {
      var post = {
        'Vendor': 'StrikeZone',
        'Set': '',
        'Name': '',
        'Style': 'Non-Foil',
        'Language': 'English',
        'NM_cash': '',
        'NM_trade': '',
        'NM_quantity': '',
        'SP_cash': '',
        'SP_trade': '',
        'SP_quantity': '',
        'PLDSP_cash': '',
        'PLDSP_trade': '',
        'PLDSP_quantity': '',
        'HP_cash': '',
        'HP_trade': '',
        'HP_quantity': ''
      }
      list = lists[list].split('\t');
      if (list[0] != null) {post['Set'] = list[0].trim();};
      if (list[1] != null) {post['Name'] = list[1].trim();};
      if (list[2] != null && list[2].trim() != '') {post['Style'] = list[2].trim();};
      if (list[3] != null) {post['NM_quantity'] = list[3].trim();};
      if (list[4] != null) {post['NM_cash'] = list[4].trim();};

      let sql = 'INSERT INTO buylists.strikezone SET ?';
      let query = db.query(sql, post, (err, result) => {
        if (err) {
          console.log(9999)
        };
      });

    }


    //list = list.trim();
    //list = list.replace('/t', ',');

    //console.log(lists);

});

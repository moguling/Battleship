const rp = require('request-promise');
const cheerio = require('cheerio');
const fs = require('fs');
const leftpad = require('left-pad');
const express = require('express');
const db = require('./db');





function Battleship(j, je, cut) {

  var upend = 2;
  var downend = 0;
  var rate = 1600;
  //*******FIND MISSING IN RANGE J-JE***********
  let getsql = 'SELECT distinct Field1 FROM psa.psa WHERE Field1 BETWEEN ' + j + ' AND ' + je + ' ORDER BY Field1 ASC;';
  let getquery = db.query(getsql, (err, result) => {
    if (err) {
      console.log(8888)
      setTimeout(function() {
        Battleship(j, je, cut)
      }, 10000)
    } else {
      var finished = [];
      for (let t = 0; t < result.length; t++) {
        finished.push(result[t].Field1);
      }
      var all = [];
      for (var r = j; r < je; r++) {
        all.push(r);
      }
      var a = [];
      var missing = [];
      for (var x = 0; x < finished.length; x++) {
        a[finished[x]] = true;
      }
      for (var x = 0; x < all.length; x++) {
        if (a[all[x]]) {
          delete a[all[x]];
        } else {
          a[all[x]] = true;
        }
      }
      for (var k in a) {
        missing.push(parseInt(k));
      }

      missing.push([9999999999]);
      var grouping = [];
      var temp = [];
      missing.forEach(function(elem, index) {
        if (elem > missing[index - 1] + 1) {
          grouping.push(temp);
          temp = [];
        }
        temp.push(elem);
      })

      grouping.sort(function(a, b) {
        return a.length - b.length;
      });
      var groups = grouping.length
      grouping = grouping.filter(function(element) {
        return element.length > cut; /////////////////////////////////////////////////////////////////////////////////////////////////////////
      })
      var viable = grouping.length
      if (viable == 0) {
        console.log('NIGGA YOU DONE')
        process.exit()
      }


        missing = grouping[0];
        if (missing.length < 1) {
          Battleship(j, je, cut)
        }
        console.log('size: ' + missing.length);
        console.log('Viable: ' + viable + '/' + groups);
        //console.log(iter);
        //console.log(pickindex);

        //PICK RANDOM ELEMENT IN MISSING
        var pick = missing[Math.floor(missing.length / 2)];
        //FIND INDEX IN MISSING
        var pickindex = missing.indexOf(pick);
        var pickdown = pickindex;
        var current = missing[pickindex];
        var current1 = current;

        //GET UP
        let refreshID = setInterval(function() {
          rate = 1500;
          let paddedID = leftpad(missing[pickindex], 8, "0");
          //console.log(pickindex);
          //console.log('current:  '+paddedID+'');
          rp("https://www.psacard.com/cert/" + paddedID + "/PSA")
            .then((html) => {
              let $ = cheerio.load(html);
              var record = [];
              $('.cert-grid-value').each(function(i, element) {
                let b = $(this);
                if (b.text().startsWith('\n')) {
                  //skip
                } else {
                  let a = $(this);
                  record.push(a.text());
                }
              });
              if (record.length > 0 && typeof record !== 'undefined') {
                console.log(record[0]);
                if (record[3].includes('MAGIC THE')) {
                  console.log(record);
                }
                if (record[3].includes('POKEMON')) {
                  console.log(record);
                }
                //console.log(rate)
                let post = {
                  Field1: record[0],
                  Field2: record[1],
                  Field3: record[2],
                  Field4: record[3],
                  Field5: record[4],
                  Field6: record[5],
                  Field7: record[6],
                  Field8: record[7],
                  Field9: record[8]
                };
                let sql = 'INSERT INTO psa.psa SET ?';
                let query = db.query(sql, post, (err, result) => {
                  if (err) {
                    console.log(9999)
                  };
                });

              } else {
                let post = {
                  Field1: current,
                  Field2: '',
                  Field3: '',
                  Field4: '',
                  Field5: '',
                  Field6: '',
                  Field7: '',
                  Field8: '',
                  Field9: ''
                };
                let sql = 'INSERT INTO psa.psa SET ?';
                let query = db.query(sql, post, (err, result) => {
                  if (err) {
                    console.log(9999)
                  };
                });
              }






              if (pickindex >= pickdown && pickindex < missing.length - 1 && record.length > 0 && typeof record !== 'undefined') {
                pickindex++;
              } else {
                if (pickindex >= pickdown) {
                  pickindex = pickdown;
                }
                //console.log(pickindex);
                if (pickindex < pickdown && (record.length == 0 || typeof record == 'undefined')) {
                  clearInterval(refreshID);
                  Battleship(j, je, cut);
                } else {
                  pickindex--;
                }
              }





            })
            .catch(console.error.bind(console));

        }, rate); //INTERVAL 1000/SEC

    }
  })

};

let j = 26000000;
let je = 27000000;
let cut = 15;


Battleship(j, je, cut);

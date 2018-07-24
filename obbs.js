const rp = require('request-promise');
const cheerio = require('cheerio');
const fs = require('fs');
const leftpad = require('left-pad');
const mysql = require('mysql');
const express = require('express');


var iter = 0;
var iterd = 0;


function Battleship(j, je) {

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


      var upend = 2;
      var downend = 0;
      var rate = 3000;
                        //*******FIND MISSING IN RANGE J-JE***********
      let getsql = 'SELECT distinct Field1 FROM psa.psa WHERE Field1 BETWEEN '+j+' AND '+je+';';
      let getquery = connection.query(getsql, (err, result) => {
        if(err) {console.log(8888)};
        var finished = [];
        for (let t = 0; t < result.length - 1; t++) {
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
        missing.forEach(function(elem, index){
          if (elem > missing[index-1]+1) {
            grouping.push(temp);
            temp = [];
          }
          temp.push(elem);
        })

        grouping.sort(function(a, b){
          return b.length - a.length;
        });
        var groups = grouping.length
        grouping = grouping.filter(function(element){
          return element.length > 8;  /////////////////////////////////////////////////////////////////////////////////////////////////////////
        })
        var viable = grouping.length
        if (viable == 0){
          console.log('NIGGA YOU DONE')
          process.exit()
        }
        missing = grouping[iter];
        if (missing.length<1){Battleship(j, je)}
        console.log('size: '+missing.length);
        console.log('Viable: '+viable+'/'+groups);

          //PICK RANDOM ELEMENT IN MISSING
        var pick = missing[Math.floor(missing.length/2)];
          //FIND INDEX IN MISSING
        var pickindex = missing.indexOf(pick);
        var pickdown = pickindex;

          //GET UP
            let refreshID = setInterval(function(){
              if (downend == 1) {
              rate = 1500;
            }

                    let paddedID = leftpad(missing[pickindex], 8, "0");
                    //console.log('current:  '+paddedID+'');
                    rp("https://www.psacard.com/cert/"+paddedID+"/PSA")
                      .then((html) => {
                        let $ = cheerio.load(html);
                        var record = [];
                        $('#table-wrapper > table > tbody > tr').each(function(i, element){
                          let a = $(this);
                          record.push(a.text());
                        })

                        console.log(record)
                        if (record.length > 0 && typeof record !== 'undefined') {

                          let post = {'Certification Number': '', 'Label Type': '', 'Reverse Cert Number/Barcode': '', 'Year': '', 'Brand': '', 'Sport': '', 'Card Number': '', 'Player': '', 'Variety/Pedigree': '', 'Grade': '', 'SMR Price Guide Value': ''};

                          for (let rec = 0; rec = record.length - 1; rec++) {


                            if(record[rec].includes('Certification Number')) {
                              post['Certification Number'] = record[rec].split('Number')[1]
                              console.log(record[rec].split('Number')[1])
                            }
                            if(record[rec].includes('Label Type')) {post['Label Type'] = record[rec].split('Type')[1]}
                            if(record[rec].includes('Reverse Cert Number/Barcode')) {post['Reverse Cert Number/Barcode'] = record[rec].split('code')[1]}
                            if(record[rec].includes('Year')) {post['Year'] = record[rec].split('ear')[1]}
                            if(record[rec].includes('Brand')) {
                              post['Brand'] = record[rec].split('and')[1]
                               if (post['Brand'].includes('MAGIC THE')) {
                                 console.log(record)
                               }
                               if (post['Brand'].includes('POKEMON')) {
                                 console.log(record);
                               }
                             }
                            if(record[rec].includes('Sport')) {post['Sport'] = record[rec].split('ort')[1]}
                            if(record[rec].includes('Card Number')) {post['Card Number'] = record[rec].split('umber')[1]}
                            if(record[rec].includes('Player')) {post['Player'] = record[rec].split('ayer')[1]}
                            if(record[rec].includes('Variety/Pedigree')) {post['Variety/Pedigree'] = record[rec].split('gree')[1]}
                            if(record[rec].includes('Grade')) {post['Grade'] = record[rec].split('ade')[1]}
                            if(record[rec].includes('SMR Price Guide Value')) {post['SMR Price Guide Value'] = record[rec].split('alue')[1]}
                          }

                        let sql = 'INSERT INTO psa.test SET ?';
                        let query = connection.query(sql, post, (err, result) => {
                          if(err) {console.log(9999)};
                        });

                      } else {
                        let post = {'Certification Number': missing[pickindex], 'Label Type': '', 'Reverse Cert Number/Barcode': '', 'Year': '', 'Brand': '', 'Sport': '', 'Card Number': '', 'Player': '', 'Variety/Pedigree': '', 'Grade': '', 'SMR Price Guide Value': ''};
                        let sql = 'INSERT INTO psa.test SET ?';
                        let query = connection.query(sql, post, (err, result) => {
                          if(err) {console.log(9999)};
                        });
                      }
                        if ((missing[pickindex+1] - missing[pickindex] == 1) && record.length > 0 && typeof record !== 'undefined') {
                                pickindex++;
                        } else {
                          upend = 1;
                          iter++;
                          if (upend == downend) {
                            Battleship(j,je);
                          }
                          clearInterval(refreshID);
                        }
                        }).catch(console.error.bind(console));
              }, rate); //INTERVAL 1000/SEC


                      //GET DOWN
          let refreshDown = setInterval(function(){
            if (upend == 1) {
            rate = 1500;
          }
                  let paddedID = leftpad(missing[pickdown], 8, "0");
                  //console.log('current:  '+paddedID+'');
                  rp("https://www.psacard.com/cert/"+paddedID+"/PSA")
                    .then((html) => {
                      let $ = cheerio.load(html);
                      var record = [];
                      $('#table-wrapper > table > tbody > tr').each(function(i, element){
                        let a = $(this);
                        record.push(a);
                      })

                      console.log(record[0][1])
                      if (record.length > 0 && typeof record !== 'undefined') {

                        let post = {'Certification Number': '', 'Label Type': '', 'Reverse Cert Number/Barcode': '', 'Year': '', 'Brand': '', 'Sport': '', 'Card Number': '', 'Player': '', 'Variety/Pedigree': '', 'Grade': '', 'SMR Price Guide Value': ''};

                        for (let rec = 0; rec = record.length - 1; rec++) {
                          if(record[rec][0].includes('Certification Number')) {
                            post['Certification Number'] = record[rec][1]
                            console.log(record[rec][1])
                          }
                          if(record[rec][0].includes('Label Type')) {post['Label Type'] = record[rec][1]}
                          if(record[rec][0].includes('Reverse Cert Number/Barcode')) {post['Reverse Cert Number/Barcode'] = record[rec][1]}
                          if(record[rec][0].includes('Year')) {post['Year'] = record[rec][1]}
                          if(record[rec][0].includes('Brand')) {
                            post['Brand'] = record[rec][1]
                             if (record[rec][1].includes('MAGIC THE')) {
                               console.log(record)
                             }
                             if (record[rec][1].includes('POKEMON')) {
                               console.log(record);
                             }
                           }
                          if(record[rec][0].includes('Sport')) {post['Sport'] = record[rec][1]}
                          if(record[rec][0].includes('Card Number')) {post['Card Number'] = record[rec][1]}
                          if(record[rec][0].includes('Player')) {post['Player'] = record[rec][1]}
                          if(record[rec][0].includes('Variety/Pedigree')) {post['Variety/Pedigree'] = record[rec][1]}
                          if(record[rec][0].includes('Grade')) {post['Grade'] = record[rec][1]}
                          if(record[rec][0].includes('SMR Price Guide Value')) {post['SMR Price Guide Value'] = record[rec][1]}
                        }

                      let sql = 'INSERT INTO psa.test SET ?';
                      let query = connection.query(sql, post, (err, result) => {
                        if(err) {console.log(9999)};
                      });

                    } else {
                      let post = {'Certification Number': missing[pickdown], 'Label Type': '', 'Reverse Cert Number/Barcode': '', 'Year': '', 'Brand': '', 'Sport': '', 'Card Number': '', 'Player': '', 'Variety/Pedigree': '', 'Grade': '', 'SMR Price Guide Value': ''};
                      let sql = 'INSERT INTO psa.test SET ?';
                      let query = connection.query(sql, post, (err, result) => {
                        if(err) {console.log(9999)};
                      });
                    }
                      if ((missing[pickindex] - missing[pickindex-1] == 1) && record.length > 0 && typeof record !== 'undefined') {
                              pickdown--;
                      } else {
                        downend = 1;

                        if (upend == downend) {
                          Battleship(j,je);
                        }
                        clearInterval(refreshDown);
                      }
                    })
                    .catch(console.error.bind(console));
            }, rate); //INTERVAL 1000/SEC
          })
 };

let j =  40000000;
let je = 41000000;

Battleship(j, je);

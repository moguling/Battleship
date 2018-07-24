const rp = require('request-promise');
const cheerio = require('cheerio');
const fs = require('fs');
const leftpad = require('left-pad');
const mysql = require('mysql');

//  let logStream = fs.createWriteStream("PSAlogALLpart28.txt", {'flags': 'a'});


var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'psa'
});

connection.connect(function(error) {
  if (!!error) {
    console.log('Error');
  } else {
    console.log('Connected');
  }
})


let j = 22000000;
let je = 23000000;

let getsql = 'SELECT Field1 FROM psa.psa WHERE Field1 >= ' + j + ' AND Field1 <= ' + je + ';';
let getquery = connection.query(getsql, (err, result) => {
      if (err) {
        console.log(8888)
      };
      //console.log(result[0].Field1);
      //console.log(result.length);
      var finished = [];
      for (let t = 0; t < result.length - 1; t++) {
        finished.push(result[t].Field1);
      }

      //FILL ALL ARRAY TO LENGTH
      var all = [];
      for (var r = j; r < je; r++) {
        all.push(r);
      }
      //console.log(all);
      var a = [];
      var missing = [];
      //FILL MISSING
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
        missing.push(k);
      }
      console.log(missing.length);

      //console.log(arr);
      //console.log(arr.length);
      //console.log(arr);
      let n = 0;
      let nend = missing.length - 1;



      let refreshID = setInterval(function() {

          let paddedID = leftpad(missing[nend], 8, "0");
          console.log('current:  ' + paddedID + '');
          rp("https://www.psacard.com/cert/" + paddedID + "/PSA")

          if (n < nend && record.length > 0 && typeof record !== 'undefined') {
            nend--;
          } else if (n >= nend) {
            clearInterval(refreshID);
          } else {
            nend--;
          };


        }, 50); //INTERVAL 1000/SEC



            .then((html) => {

                let $ = cheerio.load(html);
                var record = [];

                $('.cert-grid-value').each(function(i, element) {
                  let b = $(this);
                  if (b.text().startsWith('\n')) {

                  } else {
                    let a = $(this);
                    record.push(a.text());
                  }
                });

                if (record.length > 0 && typeof record !== 'undefined') {
                  //console.log('' + record[0] + '  ' + (missing.length - n) + '');
                  if (record[3].includes('MAGIC THE')) {
                    console.log(record);
                  }
                  if (record[3].includes('POKEMON')) {
                    console.log(record);
                  }
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
                  let query = connection.query(sql, post, (err, result) => {
                    if (err) {
                      console.log(9999)
                    };
                  });;
                } else {
                  let post = {
                    Field1: missing[nend],
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
                  let query = connection.query(sql, post, (err, result) => {
                      if (err) {
                        console.log(9999)
                      };
                    })
                  }
                  .catch(console.error.bind(console));
                })

      });

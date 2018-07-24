const cheerio = require('cheerio');
//import fetch from 'node-fetch';
const puppeteer = require('puppeteer');
const mysql = require('mysql');
const db = require('./db');

function delay(time) {
   return new Promise(function(resolve) {
       setTimeout(resolve, time)
   });
}

async function getPrice() {


  console.log('running...');
  //var d = 1;

  const browser = await puppeteer.launch({headless: true});
  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 768});

  for (let d = 1; d < 1000; d++) {

    //var curpage = toString(d);

  let url = 'https://www.cardkingdom.com/purchasing/mtg_singles?filter%5Bipp%5D=100&filter%5Bsort%5D=name&filter%5Bnonfoil%5D=1&filter%5Bfoil%5D=1&page='+d;
  console.log(url);

  await page.goto(url);

  await delay(2000);

  await page.waitFor('.itemContentWrapper');

  let bodyHTML = await page.evaluate(() => document.body.innerHTML);

  let $ = cheerio.load(bodyHTML);


  var record = [];
  $('.itemContentWrapper').each(function(i, element) {
    let a = $(this);
    //console.log(a.text());
    var anew = a.text().trim().replace('\r', '\n').split('\n');
    //console.log(anew);
    anew = anew.map(s => s.trim());
    anew = anew.filter(function(n) {
      return n != ''
    })


    var anew_length = anew.length;

    record.push(anew);



});

    //console.log(anew)
    //console.log(eachCount);
    //console.log(set);




  for (let p=0; p<record.length; p++) {

      var pob = {
        'Vendor': 'Card Kingdom',
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
        'HP_quantity': '',
      };

      if (record[p][1].includes(' (')) {
      pob['Set'] = record[p][1].split(' (')[0];
      }
      if (record[p][1].includes('FOIL')) {
        pob["Style"] = 'Foil';
      }



       pob['Name'] = record[p][0]
       if (record[p][4] != undefined) {
       var nmCash = record[p][4].replace('$', '');
       var nmCashCents = nmCash.slice(-2);
       var nmCashDollars = nmCash.slice(0, -2);
       nmCash = nmCashDollars + '.' + nmCashCents;
       pob['NM_cash'] = nmCash;
     }
      if (record[p][5] != undefined) {
       var nmTrade = record[p][5].replace('$', '');
       var nmTradeCents = nmTrade.slice(-2);
       var nmTradeDollars = nmTrade.slice(0, -2);
       nmTrade = nmTradeDollars + '.' + nmTradeCents;
       pob['NM_trade'] = nmTrade;
     }
     if (record[p][7] != undefined) {
       if (record[p][7].length <= 10) {
         pob['NM_quantity'] = record[p][7].slice(-1);
       }  else {pob['NM_quantity'] = record[p][7].slice(-2);};
     }
       //console.log(pob);


      let sql = 'INSERT INTO buylists.cardkingdom SET ?';
      let query = db.query(sql, pob, (err, result) => {
        if (err) {
          console.log(9999)
        };
      });


    }
    console.log(d);

}

browser.close();
console.log('ending');
//process.exit();
};


getPrice();

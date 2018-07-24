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


async function getABUPrice() {



console.log('running...');




let url = 'https://abugames.com/buylist?search=';



  const browser = await puppeteer.launch({headless: true});
  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 768});
  await page.goto(url);

  await page.waitFor('#search-results > div.results-header.row > abu-pagination > div > pagination-template > div.col-lg-9.text-right > select');
  await page.select('#search-results > div.results-header.row > abu-pagination > div > pagination-template > div.col-lg-9.text-right > select', '92');
  await delay(5000);
  await page.waitFor('input[name="page"]');
  await page.type('input[name="page"]', '');
  await page.keyboard.press('Backspace');
  await page.keyboard.press('Backspace');
  await page.keyboard.press('Backspace');
  await page.keyboard.press('Backspace');
  await page.type('input[name="page"]', '1427');
  await page.keyboard.press('Enter');

  for (let d = 1427; d < 1700; d++) {




  await delay(2000);
  await page.waitFor('#results-checklist-view > div > single-checklist-card-buylist > div > div:nth-child(2)');
  //const bodyHTML = await page.content();
  //console.log(bodyHTML);
  let bodyHTML = await page.evaluate(() => document.body.innerHTML);
  //console.log(bodyHTML);
  let $ = cheerio.load(bodyHTML);


  var record = [];
  $('.productEditionHere').each(function(i, element) {
    let a = $(this);
    var anew = a.text().trim().replace('\r', '\n').split('\n');
    anew = anew.map(s => s.trim());
    anew = anew.filter(function(n) {
      return n != ''
    })


    //find indexes
    var set = anew[0];
    anew.shift();
    var anew_length = anew.length;
    var eachCount = 0;
    for (let y = 0; y < anew.length; y++) {
      //count HP == number of cards
      if (anew[y].includes('HP')) {
        eachCount++;
      };
    };
    if (eachCount > 1) {

      for (let x = 1; x<eachCount; x++) {
          var h = anew.indexOf("HP")
          if (anew[h + 1].includes('$')) {
            var temp1 = anew.slice(0, h + 4)
            temp1.unshift(set);
            record.push(temp1);
            var temp2 = anew.slice(h + 4);
            anew = temp2;
            } else {
            var temp1 = anew.slice(0, h + 1)
            temp1.unshift(set);
            record.push(temp1);
            var temp2 = anew.slice(h + 1);
            anew = temp2;
          }
        }

    }


    anew.unshift(set);
    record.push(anew);



});

    //console.log(anew)
    //console.log(eachCount);
    //console.log(set);




  for (let p=0; p<record.length; p++) {

      var pob = {
        'Vendor': 'ABU',
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

      var setPos = record[p][0];
      pob['Set'] = setPos;
      var namePos = record[p][1]; //not foil or foreign
      pob['Name'] = namePos;


      if (namePos.includes(' - FOIL - ')) { //foil and foreign
        var name = namePos.split(' - FOIL - ')[0];
        pob['Name'] = name;
        var language = namePos.split(' - FOIL - ')[1];
        pob['Language'] = language;
        var style = 'Foil';
        pob['Style'] = style;
      } else if (namePos.includes(' - FOIL')) { //foil
        var name = namePos.split(' - ')[0];
        pob['Name'] = name;
        var style = 'Foil';
        pob['Style'] = style;
      } else if (namePos.includes(' - ')) {   //foreign
        var name = namePos.split(' - ')[0];
        pob['Name'] = name;
        var language = namePos.split(' - ')[1];
        pob['Language'] = language;
      }





      var nmPos = record[p].indexOf('NM-M');
      var spPos = record[p].indexOf('SP');
      var pldspPos = record[p].indexOf('PLD-SP');
      var hpPos = record[p].indexOf('HP');



      if (spPos > nmPos+1) {
        pob['NM_cash'] = record[p][nmPos+1].replace('$', '');
        pob['NM_trade'] = record[p][nmPos+2].replace('/ Trade $', '');
        pob['NM_quantity'] = parseInt(record[p][nmPos+3].replace('(', '').replace(')', ''));
      }
      if (pldspPos > spPos+1) {
        pob['SP_cash'] = record[p][spPos+1].replace('$', '');
        pob['SP_trade'] = record[p][spPos+2].replace('/ Trade $', '');
        pob['SP_quantity'] = parseInt(record[p][spPos+3].replace('(', '').replace(')', ''));
      }
      if (hpPos > pldspPos+1) {
        pob['PLDSP_cash'] = record[p][pldspPos+1].replace('$', '');
        pob['PLDSP_trade'] = record[p][pldspPos+2].replace('/ Trade $', '');
        pob['PLDSP_quantity'] = parseInt(record[p][pldspPos+3].replace('(', '').replace(')', ''));
      }
      if (record[p].length > hpPos+1) {
        pob['HP_cash'] = record[p][hpPos+1].replace('$', '');
        pob['HP_trade'] = record[p][hpPos+2].replace('/ Trade $', '');
        pob['HP_quantity'] = parseInt(record[p][hpPos+3].replace('(', '').replace(')', ''));
      }

      let sql = 'INSERT INTO buylists.abu SET ?';
      let query = db.query(sql, pob, (err, result) => {
        if (err) {
          console.log(9999)
        };
      });

      //console.log(pob);
    }
    console.log(d);
    if (d == 1) {
      await page.click('#search-results > div.results-header.row > abu-pagination > div > pagination-template > div.col-lg-9.text-right > div > button:nth-child(9)');
    } else {
      await page.click('#search-results > div.results-header.row > abu-pagination > div > pagination-template > div.col-lg-9.text-right > div > button:nth-child(10)');
    }
}

//browser.close();
console.log('ending');
//process.exit();
};


// getABUPrice('Theros', 'Agent of the Fates');
getABUPrice();

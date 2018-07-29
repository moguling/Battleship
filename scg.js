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


async function getSCGPrice() {



console.log('running...');




let url = 'https://www.starcitygames.com/login';



  const browser = await puppeteer.launch({headless: false});
  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 768});
  await page.goto(url);
  await page.waitFor('#ex_usr_email_input');
  await page.type('#ex_usr_email_input', '.............'); //LOGINS PLAINTEXT
  await page.type('#ex_usr_pass_input', '..........');
  await page.click('#ex_usr_button_div > button');
  await page.waitFor('#main_nav > nav > ul > li:nth-child(5) > a');
  await page.click('#main_nav > nav > ul > li:nth-child(5) > a');
  await page.waitFor('#bl-specific > div:nth-child(4) > div.bl-specific-name.bl-flipper');
  await page.waitFor(3000);
  await page.click('#bl-specific > div:nth-child(4) > div.bl-specific-name.bl-flipper');
  await page.waitFor(3000);
  let bodyHTML = await page.evaluate(() => document.body.innerHTML);
  let $ = cheerio.load(bodyHTML);
  var values = [];
  $('option.bl-category-option').each(function(i, element) {
    var valuethis = $(this).val();
    values.push(valuethis);
  });

  //console.log(values);


  for (var value in values) {
    console.log('New Page+++++++++++++++++++++++++++++++++++++++++++++++');
    await page.select('#bl-category-options', values[value]);

    await page.click('#bl-search-category');
    var targetRoad = [];
    ///////////AT FIRST SET, START TO LOOP THRU ALL THE OPTIONS
    var cardvals = [];

    await page.waitFor(6000);
    let cardHTML = await page.evaluate(() => document.body.innerHTML);
    let cardCheerio = cheerio.load(cardHTML);
    cardCheerio('#bl-search-results > tbody > tr > td > form > select').each(function(i, element) {
      var cardthis = $(this).attr('id');
      cardvals.push({'dropTag': cardthis, 'langTags': {}});

    });
    var thisSet = cardCheerio('option[value="+values[value]+"]').text();
    //console.log(cardvals); //CARDVALS = LIST OF SELECT IDS

    for (var cardval in cardvals) {
      var subMap = [];
      subMap.push(cardvals[cardval].dropTag);
      var langMap = [];
      cardCheerio('#bl-search-results > tbody > tr > td > form > select[id='+cardvals[cardval].dropTag+'] > option').each(function(i, element) {
        var langthis = $(this).attr('value');

        langMap.push(langthis);

      });
      subMap.push(langMap);
      targetRoad.push(subMap);
    }

    for (var item in targetRoad) {
      for (var lang in targetRoad[item][1]) {
            await page.select('#'+targetRoad[item][0], targetRoad[item][1][lang]);
            let finalLang = targetRoad[item][1][lang];
            let itemHTML = await page.evaluate(() => document.body.innerHTML);
            let itemCheerio = cheerio.load(itemHTML);
            //let finalPrice = itemCheerio('#'+targetRoad[item][0]).parent('form').parent('td').next().first().text().replace('$', '');
            //var conditions = [];

            var finalSet = itemCheerio('option[value='+values[value]+']').text().replace('\n', '').trim();
            var finalName = itemCheerio('#'+targetRoad[item][0]).parent('form').prev('div.bl-result-title').text().trim();


            let post = {
              'Vendor': '',
              'Set': '',
              'Name': '',
              'Style': 'Non-Foil',
              'Language': '',
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

            }


            post['Vendor'] = 'StarCityGames';
            post['Set'] = finalSet;

            if (finalName.includes(' - FOIL')) {
              post['Name'] = finalName.split(' - ')[0];
              post['Style'] = 'Foil';
            } else if (finalName.includes(' - (')) {
              post['Name'] = finalName.split(' - (')[0];
            } else {
              post['Name'] = finalName;
            }




            post['Language'] = finalLang;

            if (itemCheerio('#'+targetRoad[item][0].replace('language', 'condition')+'-nm').attr('disabled') != 'disabled') {
              //conditions.push({'NM': itemCheerio('#'+targetRoad[item][0].replace('language', 'condition')+'-nm').attr('id')});
              await page.click('#'+itemCheerio('#'+targetRoad[item][0].replace('language', 'condition')+'-nm').attr('id'));
              itemHTML = await page.evaluate(() => document.body.innerHTML);
              itemCheerio = cheerio.load(itemHTML);
              post['NM_cash'] = itemCheerio('#'+targetRoad[item][0]).parent('form').parent('td').next().first().text().replace('$', '');
              post['NM_trade'] = 1.5*post['NM_cash'];
              post['NM_quantity'] = 100;
            }
            if (itemCheerio('#'+targetRoad[item][0].replace('language', 'condition')+'-pl').attr('disabled') != 'disabled') {
              //conditions.push({'PL': itemCheerio('#'+targetRoad[item][0].replace('language', 'condition')+'-pl').attr('id')});
              await page.click('#'+itemCheerio('#'+targetRoad[item][0].replace('language', 'condition')+'-pl').attr('id'));
              itemHTML = await page.evaluate(() => document.body.innerHTML);
              itemCheerio = cheerio.load(itemHTML);
              post['PLDSP_cash'] = itemCheerio('#'+targetRoad[item][0]).parent('form').parent('td').next().first().text().replace('$', '');
              post['PLDSP_trade'] = 1.5*post['PLDSP_cash'];
              post['PLDSP_quantity'] = 100;
            }
            if (itemCheerio('#'+targetRoad[item][0].replace('language', 'condition')+'-hp').attr('disabled') != 'disabled') {
              //conditions.push({'HP': itemCheerio('#'+targetRoad[item][0].replace('language', 'condition')+'-hp').attr('id')});
              await page.click('#'+itemCheerio('#'+targetRoad[item][0].replace('language', 'condition')+'-hp').attr('id'));
              itemHTML = await page.evaluate(() => document.body.innerHTML);
              itemCheerio = cheerio.load(itemHTML);
              post['HP_cash'] = itemCheerio('#'+targetRoad[item][0]).parent('form').parent('td').next().first().text().replace('$', '');
              post['HP_trade'] = 1.5*post['HP_cash'];
              post['HP_quantity'] = 100;
            }
            //var maybe = [finalLang, finalPrice, conditions];
            //console.log(maybe);

            let sql = 'INSERT INTO buylists.scg SET ?';
            let query = db.query(sql, post, (err, result) => {
              if (err) {
                console.log(9999)
              };
            });
            console.log(post);

      }
    }



  }


  //await page.select('#bl-category-options', '')
}


// getABUPrice('Theros', 'Agent of the Fates');
getSCGPrice();

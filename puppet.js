const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

async function main() {


    const browser = await puppeteer.launch({ headless: true});
    const page = await browser.newPage();
    page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36');

    await page.goto('https://abugames.com/buylist/singles?search=jayemdae%20tome');
    const content = await page.waitForSelector('.productEditionHere');

    var $ = cheerio.load(content);
    $('.productEditionHere').each(function(i, element) {
      var a = $(this).text();
      console.log(a);
    })

}

main();

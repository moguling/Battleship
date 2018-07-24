var request = require('request');
var cheerio = require('cheerio');
var fs = require('fs');
var rp = require('request-promise');

var urls = [];
var names = [];
var sn = [0, 200, 400];




      rp('http://www.starcitygames.com/results?&lang%5B%5D=1&s%5B0%5D=1037&foil=foil&foil=foil&r_all=All&g_all=All&sort1=4&sort2=1&sort3=10&numpage=100&display=1&startnum=300')
      .then((html) => {
          var $ = cheerio.load(html);
          $('img', '#content').each(function(){
            var url = $(this).attr("src");
            if(url.indexOf('sales/cardscans')!= -1){
            urls.push(url);
            names.push(url.split('/').slice(-1));
          }
          })
          //console.log(urls);
          //console.log(names);
          for(var i=0; i<urls.length; i++){
            rp(urls[i]).then(function(){pipe(fs.createWriteStream('Z:/scgpics/7th edition/foil/'+names[i]))});
          }

      })
      .catch(console.error.bind(console));

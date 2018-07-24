const rp = require('request-promise');
const cheerio = require('cheerio');
const fs = require('fs');
const leftpad = require('left-pad');
const mysql = require('mysql');
const express = require('express');
const request = require('request');
var app = express();



  var card = 'lightning bolt';
  if (card.includes(' ')) {
    card = card.replace(' ', '%20');
  }
  var edition = 'Beatdown'
  if (edition.includes(' ')) {
    edition = edition.replace(' ', '%20');
  }

  var url = "https://abugames.com/buylist/singles?search=" + card + "&magic_edition=%5B%22" + edition + "%22%5D";

  console.log(url);

  rp(url)
    .then((html) => {

      var $ = cheerio.load(html);
      var arr = [];
      //console.log(html);
      $('#results-checklist-view > div > single-checklist-card-buylist:nth-child(2) > div > div:nth-child(2)').each(function(i, element) {
        var data = $(this);



        arr.push(data);

        console.log(arr)
      })
    }
  )

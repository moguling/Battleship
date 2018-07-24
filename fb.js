const rp = require('request-promise');
const cheerio = require('cheerio');
const fs = require('fs');
const leftpad = require('left-pad');
const mysql = require('mysql');
const express = require('express');



function BattleshipCFB(team, mascot) {

  var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'cfb'
  });

  connection.connect(function(error) {
    if (!!error) {
      console.log('Error');
    } else {
      console.log('Connected');
    }
  })

  var year = 2010;
  var yearend = 2017;
  var rate = 5000;

  function isNumeric(num) {
    return !isNaN(num)
  }

  if (team.includes(' ')) {team.replace(' ', '_');}
  if (mascot.includes(' ')) {mascot.replace(' ', '_');}

                    let refreshID = setInterval(function() {
                          console.log('current:  ' + year + '   ' + team + '');
                          rp("https://en.wikipedia.org/wiki/" + year + "_" + team + "_" + mascot + "_football_team")
                            .then((html) => {

                              var $ = cheerio.load(html);
                              var record = [];
                              $('#mw-content-text > div > table.wikitable[style*="font-size:95%"] > tbody > tr').each(function(element) {
                                let a = $(this);
                                record.push(a.text().split(/\r?\n/));
                              })

                              if (record.length > 0 && typeof record !== 'undefined') {
                                var Datepos = record[0].indexOf('Date');
                                var Timepos = record[0].indexOf('Time');
                                var Opponentpos = record[0].indexOf('Opponent');
                                var Opponentnumpos = record[0].indexOf('Opponent#');
                                var Rankpos = record[0].indexOf('Rank#');
                                var Sitepos = record[0].indexOf('Site');
                                var TVpos = record[0].indexOf('TV');
                                var Resultpos = record[0].indexOf('Result');
                                var Attendancepos = record[0].indexOf('Attendance');

                                for (let h = 1; h < record.length -1; h++) {
                                  let post = {
                                    'Date': '',
                                    'Time': '',
                                    'Team': '',
                                    'Rank': '',
                                    'Opponent': '',
                                    'OpponentRank': '',
                                    'Stadium': '',
                                    'City': '',
                                    'State': '',
                                    'Description': '',
                                    'TV': '',
                                    'TeamOutcome': '',
                                    'TeamScore': '',
                                    'OpponentScore': '',
                                    'OT': '',
                                    'Attendance': ''
                                  }

                                  if (record[h][Datepos].includes(", ")) {
                                    var date = record[h][Datepos].split(', ')
                                    var datey = date[1]
                                    date = date[0].split(' ')
                                    var dated = leftpad(date[1], 2, '0')
                                    if (date[0] == 'January') {
                                      var datem = '01';
                                    } else if (date[0] == 'February') {
                                      var datem = '02';
                                    } else if (date[0] == 'March') {
                                      var datem = '03';
                                    } else if (date[0] == 'April') {
                                      var datem = '04';
                                    } else if (date[0] == 'May') {
                                      var datem = '05';
                                    } else if (date[0] == 'June') {
                                      var datem = '06';
                                    } else if (date[0] == 'July') {
                                      var datem = '07';
                                    } else if (date[0] == 'August') {
                                      var datem = '08';
                                    } else if (date[0] == 'September') {
                                      var datem = '09';
                                    } else if (date[0] == 'October') {
                                      var datem = '10';
                                    } else if (date[0] == 'November') {
                                      var datem = '11';
                                    } else if (date[0] == 'December') {
                                      var datem = '12';
                                    }
                                    var date = datey+'-'+datem+'-'+dated
                                  }



                                  else {
                                    var date = record[h][Datepos].split(' ')
                                    var datey = year - 1

                                    var dated = leftpad(date[1], 2, '0')
                                    if (date[0] == 'January') {
                                      var datem = '01';
                                    } else if (date[0] == 'February') {
                                      var datem = '02';
                                    } else if (date[0] == 'March') {
                                      var datem = '03';
                                    } else if (date[0] == 'April') {
                                      var datem = '04';
                                    } else if (date[0] == 'May') {
                                      var datem = '05';
                                    } else if (date[0] == 'June') {
                                      var datem = '06';
                                    } else if (date[0] == 'July') {
                                      var datem = '07';
                                    } else if (date[0] == 'August') {
                                      var datem = '08';
                                    } else if (date[0] == 'September') {
                                      var datem = '09';
                                    } else if (date[0] == 'October') {
                                      var datem = '10';
                                    } else if (date[0] == 'November') {
                                      var datem = '11';
                                    } else if (date[0] == 'December') {
                                      var datem = '12';
                                    }
                                    var date = datey+'-'+datem+'-'+dated
                                  };



                                  if (Opponentpos !== -1) {
                                    var fullopprank = record[h][Opponentpos]
                                  } else {
                                    var fullopprank = record[h][Opponentnumpos]
                                  };
                                  var repoprank = fullopprank.replace(/\s/g, '-').split("-");
                                  if ((repoprank[0] == 'vs.') || (repoprank[0] == 'at')) {
                                    repoprank.shift()
                                  };
                                  if (repoprank[0] == 'No.') {
                                    repoprank.shift()
                                  };
                                  if (isNumeric(repoprank[0])) {
                                    var opponentrank = repoprank[0];
                                    repoprank.shift();
                                  };
                                  if (repoprank.length !== 1) {
                                    var op2 = repoprank.join(' ')
                                  } else {
                                    var op2 = repoprank.toString()
                                  };
                                  op2 = op2.replace('*', '');


                                  post['OpponentRank'] = opponentrank;


                                  post['Team'] = team;

                                  var teamrank = record[h][Rankpos].split(' ');
                                  if (teamrank.length > 1) {
                                    teamrank = teamrank[1];
                                  }
                                  var site1 = record[h][Sitepos].split(' • ');
                                  //console.log(site1);
                                  post['Stadium'] = site1[0];
                                  site1.shift();
                                  //console.log(site1);
                                  site1 = site1[0];
                                  //console.log(site1);
                                  var site2 = site1.split(', ');
                                  post['City'] = site2[0];
                                  //console.log(site2);
                                  site2.shift();
                                  var site3 = site2.join(', ');
                                  //console.log(site3);
                                  var site4 = site3.split(' (');
                                  post['State'] = site4[0];
                                  site4.shift();
                                  //console.log(site4);
                                  if (site4.length > 0) {
                                    var site5 = site4[0].replace(')', '');
                                    post['Description'] = site5;
                                  }
                                  if (Datepos !== -1) {
                                    post['Date'] = date;
                                  };
                                  if (Timepos !== -1) {
                                    post['Time'] = record[h][Timepos];
                                  };
                                  if (Opponentpos !== -1) {
                                    post['Opponent'] = op2;
                                  };
                                  if (Opponentnumpos !== -1) {
                                    post['Opponent'] = op2;
                                  };
                                  if (Rankpos !== -1) {
                                    post['Rank'] = teamrank;
                                  };
                                  //if (Sitepos !== -1){post['Site'] = record[h][Sitepos]};
                                  if (TVpos !== -1) {
                                    post['TV'] = record[h][TVpos];
                                  };
                                  var fullresult = record[h][Resultpos];
                                  var represult = fullresult.replace(/\s/g, '-').split("-");
                                  var bothscores = represult[1].split("–");
                                  var teamscore = bothscores[0];
                                  var oppscore = bothscores[1];
                                  if (Resultpos !== -1) {
                                    post['TeamOutcome'] = represult[0]
                                  };
                                  if (Resultpos !== -1) {
                                    post['TeamScore'] = teamscore
                                  };
                                  if (Resultpos !== -1) {
                                    post['OpponentScore'] = oppscore
                                  };
                                  if (Resultpos !== -1) {
                                    post['OT'] = represult[2]
                                  };



                                  if (Attendancepos !== -1) {
                                    if (record[h][Attendancepos].slice(-1) == ']') {
                                       var att = record[h][Attendancepos].split('[')
                                       var att = att[0]
                                       post['Attendance'] = att
                                    } else {post['Attendance'] = record[h][Attendancepos]}

                                  };
                                  console.log(post);



                                  let sql = 'INSERT INTO cfb.games SET ?';
                                  let query = connection.query(sql, post, (err, result) => {
                                    if (err) {
                                      console.log(9999)
                                    };
                                  });

                                }

                              }







                          }).catch(console.error.bind(console))

                          if (year < yearend) {
                            year++;
                          } else {
                            clearInterval(refreshID);

                          }


                    }, rate); //INTERVAL 1000/SEC

};
var team = 'Georgia';
var mascot = 'Bulldogs';
BattleshipCFB(team, mascot);

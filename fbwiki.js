const rp = require('request-promise');
const cheerio = require('cheerio');
const fs = require('fs');
const leftpad = require('left-pad');
const mysql = require('mysql');
const express = require('express');





function BattleshipCFB(team, mascot, year, yearend) {

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





  function isNumeric(num) {
    return !isNaN(num)
  }


  var ABBR = {'Alabama': 'AL', 'Alaska': 'AK', 'Arizona': 'AZ', 'Arkansas': 'AR', 'California': 'CA', 'Colorado': 'CO', 'Connecticut': 'CT',
  'Delaware': 'DE', 'Florida': 'FL', 'Georgia': 'GA', 'Hawaii': 'HI', 'Idaho': 'ID', 'Illinois': 'IL', 'Indiana': 'IN', 'Iowa': 'IA', 'Kansas': 'KS',
   'Kentucky': 'KY', 'Louisiana': 'LA', 'Maine': 'ME', 'Maryland': 'MD', 'Massachusetts': 'MA', 'Michigan': 'MI', 'Minnesota': 'MN', 'Mississippi': 'MS',
    'Missouri': 'MO', 'Montana': 'MT', 'Nebraska': 'NE', 'Nevada': 'NV', 'New Hampshire': 'NH', 'New Jersey': 'NJ', 'New Mexico': 'NM', 'New York': 'NY',
     'North Carolina': 'NC', 'North Dakota': 'ND', 'Ohio': 'OH', 'Oklahoma': 'OK', 'Oregon': 'OR', 'Pennsylvania': 'PA', 'Rhode Island': 'RI',
      'South Carolina': 'SC', 'South Dakota': 'SD', 'Tennessee': 'TN', 'Texas': 'TX', 'Utah': 'UT', 'Vermont': 'VT', 'Virginia': 'VA', 'Washington': 'WA',
      'West Virginia': 'WV', 'Wisconsin': 'WI', 'Wyoming': 'WY'}


      if (team.includes(' ')){team = team.replace(' ', '_')}

      if (mascot.includes(' ')){mascot = mascot.replace(' ', '_')}

  let refreshID = setInterval(function() {


    console.log('current:  ' + year + '   ' + team + '');
    rp("https://en.wikipedia.org/wiki/" + year + "_" + team + "_" + mascot +"_football_team")
      .then((html) => {
        var $ = cheerio.load(html);
        var record = [];
        $('table.wikitable[style*="font-size:95%"] > tbody > tr').each(function(element) {
          let a = $(this);
          record.push(a.text().split(/\r?\n/));

//('#Schedule').parent('h2').nextAll('table').first()

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


          for (let h = 1; h < record.length - 1; h++) { //FOR EACH RECORD IN YEAR
            let post = {
              'Year': '',
              'Month': '',
              'Day': '',
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
            var date = record[h][Datepos];
            if (date.includes('[')){date = date.split('[')[0]}
            if (date.includes(", ")) {date = date.split(', ')[0]}

            if(date.split(' ')[0] == 'January') {
              varm = '1'
            }
            if(date.split(' ')[0] == 'February') {
              varm = '2'
            }
            if(date.split(' ')[0] == 'March') {
              varm = '3'
            }
            if(date.split(' ')[0] == 'April') {
              varm = '4'
            }
            if(date.split(' ')[0] == 'May') {
              varm = '5'
            }
            if(date.split(' ')[0] == 'June') {
              varm = '6'
            }
            if(date.split(' ')[0] == 'July') {
              varm = '7'
            }
            if(date.split(' ')[0] == 'August') {
              varm = '8'
            }
            if(date.split(' ')[0] == 'September') {
              varm = '9'
            }
            if(date.split(' ')[0] == 'October') {
              varm = '10'
            }
            if(date.split(' ')[0] == 'November') {
              varm = '11'
            }
            if(date.split(' ')[0] == 'December') {
              varm = '12'
            }

            var vard = date.split(' ')[1]

            var vary = year-1

            if (varm == '1' && h > 4) { vary = vary + 1}

            //date = vary+'-'+varm+'-'+vard;

            if (Timepos !== -1) {
            var time = record[h][Timepos];
            if (time.includes('[')){time = time.split('[')[0]}
            if ((time == 'noon')||(time == 'Noon')){time = '12:00 PM'}
            if (time.includes('p.m.')){time = time.replace('p.m.', 'PM')}
            if (time.includes('a.m.')){time = time.replace('a.m.', 'AM')}
          }
          if (TVpos !== -1) {
            var tv = record[h][TVpos];
            if (tv.includes('[')){tv = tv.split('[')[0]}
          }
          if (Attendancepos !== -1) {
            var attendance = record[h][Attendancepos];
            if (attendance.includes('[')){attendance = attendance.split('[')[0]}
          }
            if (Opponentpos !== -1) {
              var combopprank = record[h][Opponentpos]
            }
            if (Opponentnumpos !== -1) {
              var combopprank = record[h][Opponentnumpos]
            };

            if (combopprank.includes('*')) {
              combopprank = combopprank.slice(0, -1);
            }
            //console.log(combopprank)
            if (combopprank.substring(0, 2) == 'at') {
              combopprank = combopprank.slice(3);
            }

            if (combopprank.substring(0, 2) == 'vs') {
              combopprank = combopprank.slice(4);
            }
            if (combopprank.substring(0, 3) == 'No.') {
              combopprank = combopprank.slice(4);
            }
            //combopprank = combopprank.split("")
          //console.log(combopprank)

            if (isNumeric(combopprank[2])) {
              var opponentrank = combopprank[0]+combopprank[1];
              //console.log(opponentrank)
              post['OpponentRank'] = opponentrank;
              combopprank = combopprank.slice(3);
            } else if (isNumeric(combopprank[0])) {
              var opponentrank = combopprank[0];
              //console.log(opponentrank)
              post['OpponentRank'] = opponentrank;
              combopprank = combopprank.slice(2);
            }




            //console.log(combopprank)






            if (team.includes('_')){team = team.replace('_', ' ')}

            post['Team'] = team;

            if (Rankpos !== -1) {
            var teamrank = record[h][Rankpos].split(' ');
            if (teamrank.length > 1) {
              teamrank = teamrank[1];
            }
          }
          if (Sitepos !== -1) {
            var site = record[h][Sitepos];
            if (site.includes(' (')) {
              var description = site.split(' (')[1];
              description = description.slice(0, -1);
              post['Description'] = description;
              site = site.split(' (')[0];
            }

            if (site.includes(' • ')) {
              var stadium = site.split(' • ')[0];
              post['Stadium'] = stadium;
              site = site.split(' • ')[1];
            }

            if (site.includes(', ')) {
              var state = site.split(', ')[1];

              if (state.length > 2) {
                state = ABBR[state];
                // var statenames = Object.keys(ABBR);
                // console.log(statenames)
              }
              post['State'] = state;
              site = site.split(', ')[0];
            }

            post['City'] = site;}

            if (Datepos !== -1) {
              post['Year'] = vary
              post['Month'] = varm
              post['Day'] = vard
            };
            if (Timepos !== -1) {
              post['Time'] = time
            };
            if (Opponentpos !== -1) {
              post['Opponent'] = combopprank
            };
            if (Opponentnumpos !== -1) {
              post['Opponent'] = combopprank
            };
            if (Rankpos !== -1) {
              post['Rank'] = teamrank
            };
            //if (Sitepos !== -1){post['Site'] = record[h][Sitepos]};
            if (TVpos !== -1) {
              post['TV'] = tv
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
              post['Attendance'] = attendance
            };
            //console.log(post);

            let sql = 'INSERT INTO cfb.games SET ?';
            let query = connection.query(sql, post, (err, result) => {
              if (err) {
                console.log(9999)
              };
            });



          }




        };








      })
      .catch(console.error.bind(console));

      if (year > yearend){
        clearInterval(refreshID)
        process.exit(0)
      } else {year++}

  }, rate); //INTERVAL 1000/SEC

};
var year = 1955;
var yearend = 2017;
var team = 'Air Force';
var mascot = 'Falcons';
var rate = 2000;
BattleshipCFB(team, mascot, year, yearend, rate);

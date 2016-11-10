var request = require('request');
var cheerio = require('cheerio');
var async = require('async');
var moment = require('moment');
var finishedYears = [];

const MAX_CONCURRENT = 20;
const BASE_URL = "https://www.supremecourt.gov/search.aspx?filename=docketfiles/";
const NOT_FOUND = '404';
const MAX_CASE_NUM = 3000;

function wasDistributed(text) {
  return text.includes('DISTRIBUTED for Conference');
}

function makeRequest(results, urlObject, callback) {
  var url = urlObject.url;
  var year = urlObject.year;

  var options = {
    url: url,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2785.143 Safari/537.36',
      'Upgrade-Insecure-Requests': '1',
      'Cache-Control':'no-cache',
      'Connection':'keep-alive',
      'Cookie':'ASP.NET_SessionId=wevaz1nksat03gr20ieywnge; US-SUPREME-COURT=335718592.20480.0000',
      'Host':'www.supremecourt.gov',
      'Pragma':'no-cache'
      }
  };

  // make a http request 
  request(options, function(error, response, html){


    // Bail on errors
    if (error || response.statusCode !== 200) {
      console.log(`error getting ${url}`, error);
      callback(); 
      return;
    }

    //Load HTML and check if the docket is found
    var $ = cheerio.load(html);
    var body = $('body');
    if(!body.html().includes("~Date")) {
      console.log('not found');
      callback(); 
      return;
    }

    // find the docket table with "Proceedings" column
    var table = $('td').filter(function(i,el){
      return $(el).text().includes("~Proceedings")
    }).first().parent().parent().parent();

    //look for 'DISTRIBUTED'...TODO: but only if case isn't already closed
    var distributions = [];
    var grantedOrDenied = false;
    table.find("tr").each(function(i,tr){
      if(grantedOrDenied) return;
        
      var tds = $(tr).find('td');
      if(tds[0] && tds[1]) {
        var dateCreated = $(tds[0]).text();
        var orderText = $(tds[1]).text();
        
        if(orderText.includes("Petition GRANTED") || orderText.includes("Petition DENIED")){
            grantedOrDenied = true;
            return;
          }

        if(wasDistributed(orderText)) {
            distributions.push({
            date: dateCreated,
            text: orderText
          })    
        }
      }
    });



    //if test passed
    if(distributions.length > 1 && !grantedOrDenied) {
      output = {
        url: url,
        distributions: distributions
      }
      results.push(output);
    }

    //next
    callback(); 
    
  });   
}



//links = [{year:2015, url:'https://www.supremecourt.gov/search.aspx?filename=docketfiles/16-32.htm'}];

function searchCases(year, startCaseNum, endCaseNum) {
  // var currentYearPart = moment().year()-2000;
  // var firstYearPart = currentYearPart-numYearsBack;
  var results = [];

  var links = [];
  for(var caseNum = startCaseNum; caseNum < endCaseNum; caseNum++) {
    var url = `${BASE_URL}${year}-${caseNum}.htm`;
    links.push({year:year, url:url});
  }

  return p = new Promise(function(resolve, reject){
    async.eachLimit(links, MAX_CONCURRENT, makeRequest.bind(null,results), function(err) {
      if(err) {
        reject(err);
      }
      else {
        resolve(results);
      }
    });
  })
  
}


module.exports = {
  searchCases: searchCases
}
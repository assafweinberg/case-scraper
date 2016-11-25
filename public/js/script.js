
$(function(){
  
  var CHUNK = 50;
  var resultsList = $('#results');
  var statusText = $('#status');

  function callAPI(year,start,end) {
     return new Promise(function(resolve,reject){
      statusText.text('searching ' + (parseInt(year) + 2000) + ' cases: ' + start + ' - ' + end)
      $.post(`/cases/${year}/${start}/${end}`, function(cases){
       renderCases(cases);
       resolve();
      });
     })
  }

  function callAllInSequence(fns){
    if(fns.length === 0)
      return;

    var fn = fns.pop();
    fn().then(function(){
      callAllInSequence(fns);
    })
  }



  //click handler
  $('#btn-search').click(function(){
    $('#results').empty();
    var currentYear = new Date().getFullYear()-2000;

    var lastYearStart = parseInt($('#prev-start').val());
    var lastYearEnd = parseInt($('#prev-end').val());
    var currentYearStart = parseInt($('#current-start').val());
    var currentYearEnd = parseInt($('#current-end').val());

    var fnQueue = [];
    for(var i = lastYearStart; i < lastYearEnd; i+=CHUNK) {
      fnQueue.push(callAPI.bind(null,currentYear-1,i,i+CHUNK))
    }
    for(var i = currentYearStart; i < currentYearEnd; i+=CHUNK) {
      fnQueue.push(callAPI.bind(null,currentYear,i,i+CHUNK))
    }

    fnQueue.reverse();
    callAllInSequence(fnQueue);
  })

  //Render
  function renderCases(cases) {
    console.log('rendering cases', cases)
    cases = JSON.parse(cases);
    //TODO: render cases
    var resultsList = $('#results')
    cases.forEach(function(c){
      var result = $('<li><a href="' + c.url + '" target="_blank">' + c.url + '</a></li>');
      resultsList.append(result);
    })
  }


})
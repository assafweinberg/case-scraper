
$(function(){
  var results = $('#results')
  var CHUNK = 50;

  //TODO: Get these numbers from form
  var year = 16;
  var startCaseNum = 0;
  var endCaseNum = 500;



  function callAPI(year,start,end) {
     return new Promise(function(resolve,reject){
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

  $('#btn-search').click(function(){
    var fnQueue = [];
    for(var i = startCaseNum; i < endCaseNum; i+=CHUNK) {
      fnQueue.push(callAPI.bind(null,year,i,i+CHUNK))
    }


    callAllInSequence(fnQueue);
  })

  function renderCases(cases) {
    console.log('rendering cases', cases)
    //TODO: render cases
  }


})
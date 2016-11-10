
$(function(){
  var results = $('#results')
  var MAX_CHUNK = 100;

  //TODO: Get these numbers from form
  var year = 16;
  var startCaseNum = 0;
  var endCaseNum = 500;


  $('#btn-search').click(function(){
    for(var i = startCaseNum; i < endCaseNum; i++) {
      $.post('/cases/16/0/1000', renderCase);  
    }
  })

  function renderCase()


})
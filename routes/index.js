var express = require('express');
var router = express.Router();
var scraper = require('../modules/scraper');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/cases/:year/:start/:end', function(req,res){
  //searchCases(year, startCaseNum, endCaseNum)
  scraper.searchCases(parseInt(req.params.year), parseInt(req.params.start), parseInt(req.params.end))
    .then(function(cases){
      res.send(JSON.stringify(cases));
    }).catch(function(err){
      res.send([])
    })
})

module.exports = router;

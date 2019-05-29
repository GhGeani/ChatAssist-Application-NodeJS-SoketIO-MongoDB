let router = require('express').Router();
let path = require('path');

router.get('/', function(req,res){
    res.sendFile(path.join(__dirname + '/../view/admin.html'));
})

module.exports = router;
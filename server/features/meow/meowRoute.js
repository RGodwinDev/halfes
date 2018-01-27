const axios = require('axios');
module.exports = function(app) {
  app.get('/api/getCat', function(req, res){
    axios.get("http://random.cat/meow").then(function(url){
      res.send(url.data);
    });
  });
}

//axios is required here because cats werent an extension like the random-puppy was.

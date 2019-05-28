// server.js
// where your node app starts

// init project
const express = require('express');
const app = express();
var request= require('request');
require('dotenv').config();
const yelp= require('yelp-fusion');
const bodyParser= require('body-parser')
const apiKey= process.env.YELP_API_KEY;
var MongoClient= require('mongodb');
var mongoose= require('mongoose')
var session= require('express-session');
var passport= require('passport');
var cookieParser= require('cookie-parser')
var mongoStore= require('connect-mongo')(session);
var FileStore = require('session-file-store')(session);

// we've started you off with Express, 
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());

app.set('view engine', 'html')
app.engine('html', require('ejs').renderFile);
app.use(passport.initialize());
app.use(passport.session());
app.use(session({
    store: new FileStore({ttl: 60000*10}),
    secret: 'keyboard cat',
    saveUninitialized: true,
    resave: true
}));

MongoClient.connect(process.env.DB,function(err,db){
    if(err){
     console.log('error')
    }
    else{


// http://expressjs.com/en/starter/basic-routing.html
app.get('/', function(request, response) {
  //request.session.destroy()
  var d= new Date();
   var m= d.getMonth(); var t= d.getDate(); var y= d.getFullYear();
  //console.log(d.getDate())
       var and=[];
/*     db.collection('bars').find({email:'l@l'}).toArray(function(err,docs){
  
   for(var i=0; i<docs[0]['rsvp'].length; i++){
       console.log(docs[0]['rsvp'][i][1].getMonth())
     if(docs[0]['rsvp'][i][1].getMonth==m && docs[0]['rsvp'][i][1].getDate==t && docs[0]['rsvp'][i][1].getFullYear==y){
        and.push(docs[0]['rsvp'][i][0])
     }
   }
     })*/
  response.render(__dirname + '/views/index.html',{display:false});
});


app.get('/views/add', function(req, res) {
    console.log('add?');
  if(req.session.email){
     db.collection('bars').find({email:req.session.email}).toArray(function(err,docs){
       docs[0]['rsvp'][docs[0]['rsvp'].length]=[req.query.id, new Date()];
       db.collection('bars').findOneAndUpdate({email:req.session.email}, {$set:{name:docs[0]['name'], email:docs[0]['email'], location: docs[0]['location'], rsvp: docs[0]['rsvp']}},function(err,docs){

         res.redirect('/views/user');
    
       })
     })
  }
  else{
   res.render(__dirname + '/views/login.html', {display:false}); 
  }
});
      
      
app.get('/views/remove', function(req, res) {
    console.log('remove?');
  if(req.session.email){
     db.collection('bars').find({email:req.session.email}).toArray(function(err,docs){
       
       for(var i=0; i<docs[0]['rsvp'].length; i++){
         if(docs[0]['rsvp'][i][0]==req.query.id){
           docs[0]['rsvp'][i]="";
         }
       }
       
       docs[0]['rsvp']=docs[0]['rsvp'].filter(x=>x!="")
       
       db.collection('bars').findOneAndUpdate({email:req.session.email}, {$set:{name:docs[0]['name'], email:docs[0]['email'], location: docs[0]['location'], rsvp: docs[0]['rsvp']}},function(err,docs){

         res.redirect('/views/user');
    
       })
     })
  }
  else{
   res.render(__dirname + '/views/login.html', {display:false}); 
  }
});


app.get('/login', function(req, res) {
    //console.log(req.session)

  
  res.render(__dirname + '/views/login.html', {display:false});
});

 app.get('/logout', function(req, res) {
    req.logout();
    req.session.destroy();
    res.redirect('/'); 
 })
      
app.get('/views/user', function(req, res) {
  if(req.session.email){
     db.collection('bars').find({email:req.session.email}).toArray(function(err,docs){
   var d= new Date();
   var m= d.getMonth(); var t= d.getDate(); var y= d.getFullYear();
  //console.log(d.getDate())
       var and=[];
   for(var i=0; i<docs[0]['rsvp'].length; i++){
     if(docs[0]['rsvp'][i][1].getMonth()==m && docs[0]['rsvp'][i][1].getDate()==t && docs[0]['rsvp'][i][1].getFullYear()==y){
        and.push(docs[0]['rsvp'][i][0])
     }
   }
       
  const searchRequest = {
  term: 'bars',
  location: docs[0]['location'],
};

const client = yelp.client(apiKey);

client.search(searchRequest)
  .then((response) => {
    console.log(response.jsonBody);

    res.render(__dirname + '/views/user.html', {and: and,ans: response.jsonBody,display:true,loc:docs[0]['location']});

  })
  .catch((error) => {
    //console.log(error);
    res.render(__dirname + '/views/user.html', {and: and, display:false});

  });
  
  })    
    

  // res.render(__dirname + '/views/user.html', {ans: response.jsonBody, display:true, loc:docs[0]['location']});
    
  //  })    
    
  }
  else{
    res.redirect('/');   
  }
});
      
      
app.post('/views/user', function(req,res){
  
  db.collection('bars').find({email:req.session.email}).toArray(function(err,docs){
   var d= new Date();
   var m= d.getMonth(); var t= d.getDate(); var y= d.getFullYear();
  //console.log(d.getDate())
       var and=[];
   for(var i=0; i<docs[0]['rsvp'].length; i++){
     if(docs[0]['rsvp'][i][1].getMonth()==m && docs[0]['rsvp'][i][1].getDate()==t && docs[0]['rsvp'][i][1].getFullYear()==y){
        and.push(docs[0]['rsvp'][i][0])
     }
   }

const searchRequest = {
  term: 'bars',
  location: req.body.dream,
};

const client = yelp.client(apiKey);

client.search(searchRequest)
  .then((response) => {
    //console.log(response.jsonBody);

    res.render(__dirname + '/views/user.html', {and: and,ans: response.jsonBody,display:true,loc:req.body.dream});

  })
  .catch((error) => {
    //console.log(error);
    res.redirect(__dirname + '/views/user');

  });
    
  
})
  
});
      

app.post('/login', function(req,res){
  
  if(req.body.dream1 && req.body.dream12){
    
db.collection('bars').find({email: req.body.dream1, password: req.body.dream12}).toArray(function(err,docs){
  if(docs.length<1){
    console.log('incorrect information')
    res.render(__dirname + '/views/login.html', {display:'1'});
  }
  else{
    req.session.email=req.body.dream1;    
    res.redirect('/views/user');
  }

})


  
  }
  else if(req.body.dream2 && req.body.dream3 && req.body.dream32 && req.body.dream4){
  
db.collection('bars').find({email: req.body.dream3}).toArray( function(err,docs){
  if(docs.length<1){
    db.collection('bars').insertOne({name:req.body.dream2, email: req.body.dream3, password: req.body.dream32, location: req.body.dream4, rsvp:[]}, function(err,docs){
    
    })
    req.session.email=req.body.dream3;
    
    res.redirect('/');
  }
  else{
    console.log('email exists')
    res.render(__dirname + '/views/login.html', {display:'2'});
    
  }

})  


  
  }
  else{
    res.redirect('/views/user');

  }  
})


app.post('/', function(req,res){
  if(req.body.dream){
  const searchRequest = {
  term: 'bars',
  location: req.body.dream,
};
    console.log(req.body.dream)

const client = yelp.client(apiKey);

client.search(searchRequest)
  .then((response) => {
    //console.log(response.jsonBody);
    res.render(__dirname + '/views/index.html', {ans: response.jsonBody,display:true,loc:req.body.dream});

  })
  .catch((error) => {
    //console.log(error);
    res.render(__dirname + '/views/index.html', {display:false});

  });
  
  }
  else{
    res.render(__dirname + '/views/index.html', {display:false});

  }  
})

      
      
    }
})

// listen for requests :)
const listener = app.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});

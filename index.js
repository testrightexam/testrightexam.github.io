//Routing Mechanism - URL Define Here.
const express = require('express');

//Express Only Get Data If Body-Parser Is Worked.
//To Get Value Of Any Control Body-Parser Is Compulsory.
var bodyParser = require('body-parser');

//Object Of Express.
const app = express();
app.use(express.static('views'))
//Express Object Uses Body-Parser Object.
app.use(bodyParser());

//MongoClient Object - To Connect MongoDB.
//const MongoClient = require('mongodb').MongoClient;

//URL Of MongoDB Server.
const uri = 'mongodb+srv://testright:Triangle@3@cluster0-grnvl.mongodb.net/test?retryWrites=true';
const url = 'mongodb+srv://testright:Triangle@3@cluster0-grnvl.mongodb.net/test?retryWrites=true';

const MongoClient = require('mongodb').MongoClient;
//const uri = "mongodb+srv://testright:<password>@cluster0-grnvl.mongodb.net/test?retryWrites=true";
const client = new MongoClient(uri, { useNewUrlParser: true });
client.connect(err => {
  const collection = client.db("TestRight").collection("test");
  // perform actions on the collection object
  collection.insertOne({'Vishal':'Tanwani'});
  client.close();
});


//Database Name.
const dbName = 'TestRight';

app.get('/', (req, res) => {
	res.render('login');
});
app.get('/login', (req, res) => {
	res.render('login');
});

app.get('/register',(req,res)=>{
	res.render('register');
});

app.get('/RegisterExaminer',(req,res)=>{
	res.render('register');
});


app.post('/RegisterExaminer',(req,res)=>{
	MongoClient.connect(url,{ useNewUrlParser: true },function(err,client){
		console.log("server is connected");
		
		const db = client.db(dbName);
		const collection = db.collection('Examiners');
		collection.insertOne(
			{
				Name: req.param('ExmUsrName', null),
				Email : req.param('ExmUsrEmail', null),
				Password : req.param('ExmUsrPass', null),
				/*EmailId : req.param('TxtEmailId', null),
				Password : req.param('TxtPassword', null)*/
			},function(err,result){
				res.redirect('/MemberRecordsExaminers');
		});
		
	
	});

});

app.get('/LoginExaminer',(req,res)=>{
	res.render('login');
});

app.post('/LoginExaminer',(req,res)=>{
	MongoClient.connect(url,{ useNewUrlParser: true },function(err,client){
		console.log("Trying to Login");
		
		const db = client.db(dbName);
		
		db.collection('Examiners').findOne({
				$and:
				[	
					{Email : req.param('ExmUsrEmail', null)},
					{Password : req.param('ExmUsrPass', null)}
				]
				
			}, function(err, user) {
             if(user ===null){
               res.end("Login invalid");
			   console.log("Login Invaild");
            } else {
            console.log(user);
            res.end("Login valid");
          }
	});
			
	});

});
	
app.get('/RegisterStudent',(req,res)=>{
	res.render('register');
});

app.post('/RegisterStudent',(req,res)=>{
	MongoClient.connect(url,{ useNewUrlParser: true },function(err,client){
		console.log("server is connected");
		
		const db = client.db(dbName);
		const collection = db.collection('Students');
		collection.insertOne(
			{
				Name: req.param('StdUsrName', null),
				Email : req.param('StdUsrEmail', null),
				Password : req.param('StdUsrPass', null),
				
			},function(err,result){
				res.redirect('/MemberRecordsStudents');
		});
		
	
	});

});
app.get('/LoginStudent',(req,res)=>{
	res.render('login');
});

app.post('/LoginStudent',(req,res)=>{
	MongoClient.connect(url,{ useNewUrlParser: true },function(err,client){
		console.log("Trying to Login");
		
		const db = client.db(dbName);
		
		db.collection('Students').findOne({
				$and:
				[	
					{Email : req.param('StdUsrEmail', null)},
					{Password : req.param('StdUsrPass', null)}
				]
				
			}, function(err, user) {
             if(user ===null){
               res.end("Login invalid");
			   console.log("Login Invaild");
            } else {
            console.log(user);
            res.end("Login valid");
          }
	});
			
	});

});


app.get('/MemberRecordsExaminers',(req,res)=>{
	MongoClient.connect(url,{ useNewUrlParser: true },function(err,client){
		console.log("server is connected");
		
		const db = client.db(dbName);
		const collection = db.collection('Examiners');
		collection.find({}).toArray(function(err,docs)
		{
			console.log(docs);
			res.render('MemberRecordsExaminers',{data:docs});
		
		});	
		client.close();
	});
})


app.get('/MemberRecordsStudents',(req,res)=>{
	MongoClient.connect(url,{ useNewUrlParser: true },function(err,client){
		console.log("server is connected");
		
		const db = client.db(dbName);
		const collection = db.collection('Students');
		collection.find({}).toArray(function(err,docs)
		{
			console.log(docs);
			res.render('MemberRecordsStudents',{data:docs});
		
		});	
		client.close();
	});
})


//Httpserver Port Number 3000.

app.listen(process.env.PORT || 3000, function(){
  console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});

//Set The File Type To App As EJS.
app.set('view engine', 'ejs');

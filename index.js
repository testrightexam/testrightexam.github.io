//Routing Mechanism - URL Define Here.
const express = require('express');
var ObjectId = require('mongodb').ObjectID;
//Express Only Get Data If Body-Parser Is Worked.
//To Get Value Of Any Control Body-Parser Is Compulsory.
var bodyParser = require('body-parser');

//Node Session and cookies
var cookieParser = require('cookie-parser');
var session = require('express-session');
//var Url = require('url');
//Object Of Express.
const app = express();
app.use(express.static('views'))
//Express Object Uses Body-Parser Object.
app.use(bodyParser.urlencoded({ extended: true }));
//app.use(bodyParser.json());

// initialize cookie-parser to allow us access the cookies stored in the browser. 
app.use(cookieParser());

// initialize express-session to allow us track the logged-in user across sessions.
app.use(session({
    key: 'user_sid',
    secret: 'somerandonstuffs',
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: 600000
    }
}));


// This middleware will check if user's cookie is still saved in browser and user is not set, then automatically log the user out.
// This usually happens when you stop your express server after login, your cookie still remains saved in the browser.
app.use((req, res, next) => {
    if (req.cookies.user_sid && !req.session.user) {
        res.clearCookie('user_sid');        
    }
    next();
});


// middleware function to check for logged-in users
var sessionChecker = (req, res, next) => {
    if (req.session.user && req.cookies.user_sid) {
		if(req.session.user.type=="Faculty")
			res.redirect('/Dashboard');
		else
			res.redirect('/StudentDashboard');
    } else {
        next();
    }    
};

var checkFaculty = (req, res, next) => {
    if(req.session.user && req.session.user.type=="Faculty") {
		next();
    } else {
        res.redirect('/login');
    }    
};

var checkStudent = (req, res, next) => {
    if(req.session.user && req.session.user.type=="Student") {
		next();
    } else {
        res.redirect('/login');
    }  
};


//URL Of MongoDB Server.
const url = 'mongodb+srv://testright:Triangle@3@cluster0-grnvl.mongodb.net/test?retryWrites=true';

//Mongo Client Variable
const MongoClient = require('mongodb').MongoClient;
//const uri = "mongodb+srv://testright:<password>@cluster0-grnvl.mongodb.net/test?retryWrites=true";

//Database Name.
const dbName = 'TestRight';

app.get('/', sessionChecker, (req, res) => {
	res.render('homepage');
});
app.get('/login', sessionChecker, (req, res) => {
//	console.log("hello");
	res.render('login');
});

app.get('/register', sessionChecker,(req,res)=>{
	res.render('register');
});

app.get('/RegisterExaminer',(req,res)=>{
	res.render('register');
});

app.get('/TestCreate', checkFaculty ,(req,res)=>{
	if (req.session.user && req.cookies.user_sid) {
		res.render('testcreation_step1');
	}
	else
	{
		 res.redirect('/login');
	}
});
app.get('/exam',(req,res)=>{
	if (req.session.user && req.cookies.user_sid) {
		res.render('exam');
	}
	else
	{
		 res.redirect('/login');
	}
});
app.get('/AddQuestions',checkFaculty,(req,res)=>{
	if (req.session.user && req.cookies.user_sid && req.cookies["id"] && req.session.user.type=="Faculty") {
		MongoClient.connect(url,{ useNewUrlParser: true },function(err,client){
		console.log("Inside Add Questions \nAdding Data to :- \n");
		const db = client.db(dbName);
		const collection = db.collection('tests');
		var mongo = require('mongodb');
		var id=new mongo.ObjectID(req.cookies["id"]);
		collection.find({_id:id}).toArray(function(err,docs)
		{
			console.log(docs);
			res.render('testcreation_step2',{data:docs});

		});	
		client.close();
		
	});

	}
	else
	{
		 res.redirect('/Dashboard');
	}


});

app.get('/StudentDashboard',(req,res)=>{
	if (req.session.user && req.cookies.user_sid && req.session.user.type=="Student") {
	res.render('StudentDashboard');
	}
	else
	{
		res.redirect('/login');
	}
});

app.get('/Dashboard',(req,res)=>{
	if (req.session.user && req.cookies.user_sid && req.session.user.type=="Faculty") {
		MongoClient.connect(url,{ useNewUrlParser: true },function(err,client){
		console.log("Opening Dashboard...");
		res.clearCookie("id");
		const db = client.db(dbName);
		var email=req.session.user.Email;
			var data=[];
			console.log(email);
				var d = new Date(),
					month = '' + (d.getMonth() + 1),
					day = '' + d.getDate(),
					year = d.getFullYear();
			
				if (month.length < 2) month = '0' + month;
				if (day.length < 2) day = '0' + day;
			
				var date_1=[year, month, day].join('-');
				console.log(date_1);
			
			db.collection('Examiners').findOne({Email: req.session.user.Email},
				function(err,docs)
				{
					//console.log(docs);
					data=docs;
				});
			
				db.collection('tests').find({Examiner_id: req.session.user.Email}).toArray
				(function(err,docs)
				{
					//console.log(docs);
					res.render('dashboard',{data,data1:docs,date_1});
				});
				
		
	});
	}
	else
	{
		 res.redirect('/login');
	}
});


// route for user logout
app.get('/logout', (req, res) => {
    if (req.session.user && req.cookies.user_sid) {
        res.clearCookie('user_sid');
        res.redirect('/');
    } else {
        res.redirect('/login');
    }
});



app.post('/RegisterExaminer',(req,res)=>{
	MongoClient.connect(url,{ useNewUrlParser: true },function(err,client){
		console.log("Registration of Examiner...");

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

				res.redirect('/login');
		});


	});

});

app.get('/SaveExaminerProfile',checkFaculty,(req,res)=>{
	if (req.session.user && req.cookies.user_sid && req.session.user.type=="Faculty") {
		
		res.render('register_examiner');
	}
	else
	{
		 res.redirect('/login');
	}
});

app.post('/SaveExaminerProfile',checkFaculty,(req,res)=>{
	MongoClient.connect(url,{ useNewUrlParser: true },function(err,client){
		console.log("Edit Profile of Examiner...");
		const db = client.db(dbName);
		const collection = db.collection('Examiners');
		var mongo = require('mongodb');
		var id=new mongo.ObjectID(req.session.user._id);
		console.log(req.session.user._id);
		collection.updateOne(
				{_id: id},
				{$set:{
					InstituteName: req.param('InstName', null),
					InstituteType: req.param('insttype', null),
					InstituteAddress: req.param('Address', null),
					InstituteCountry: req.param('conttype', null),
					ExaminerContact: req.param('Contact',null)
				}}
			, function(err, result){
				if(err)	throw error;
			});
		res.redirect('/Dashboard');
	});

});


app.post('/AddQuestionRedirect',checkFaculty,(req,res)=>{
	res.cookie("id",req.param('test_id',null));
	console.log(req.param('test_id',null));
	res.redirect('/AddQuestions');
});


function createTestId(testtitle){
	var newid = testtitle.trim().substring(0,2).toUpperCase();
	var seed = (new Date()).getTime();
	var l = seed.toString().length;
	var s = seed.toString().substring(l-3, l+1);
	newid = newid + s;
	console.log("just created "+newid);
	return newid;
}


app.post('/TestCreate',checkFaculty,(req,res)=>{
	MongoClient.connect(url,{ useNewUrlParser: true },function(err,client){
		console.log("Inside test Creation...");

		const db = client.db(dbName);
		const collection = db.collection('tests');
		collection.insertOne(
			{
				//Name: req.param('ExmUsrName', null),
				Examiner_id:req.session.user.Email,
				Test_title:req.param('TestTitle', null),
				t_id:createTestId(req.param('TestTitle', "Title")),
				Subject:req.param('TestSubject', null),
				Date:req.param('TestDate', null),
				Time:req.param('TestTime', null),
				Duration:req.param('TestDuration', null),
				tags:req.param('TestTags', null),
				private:req.param('TestType', null)
				/*"questions":{
					"question":{"value":"What is Html ?",
					"options":{
						"A":{
							"value":"Something",
							"correct":false
							},
						"B":{
							"value":"More",
							"correct":true
							}
						}
					}
				}*/


			},function(err,result){
				//console.log(result.insertedId);
				res.cookie("id",result.insertedId);
				res.redirect('/AddQuestions');
		});
		collection.find({}).toArray(function(err,docs)
		{
			//console.log(docs);
		});

	});

});


app.get('/LoginExaminer', sessionChecker,(req,res)=>{
	res.clearCookie("id");
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
            
			req.session.user = user;
			req.session.user.type = "Faculty";
			console.log(req.session.user);
			/*var email=req.param('ExmUsrEmail',null);
			var data=[];
			console.log(email);
				var d = new Date(),
					month = '' + (d.getMonth() + 1),
					day = '' + d.getDate(),
					year = d.getFullYear();
			
				if (month.length < 2) month = '0' + month;
				if (day.length < 2) day = '0' + day;
			
				var date_1=[year, month, day].join('-');
				console.log(date_1);
			
			db.collection('Examiners').findOne({Email: req.param('ExmUsrEmail',null)},
				function(err,docs)
				{
					console.log(docs);
					data=docs;
				});
			
				db.collection('tests').find({Examiner_id: req.param('ExmUsrEmail',null)}).toArray
				(function(err,docs)
				{
					console.log(docs);
					res.render('dashboard',{data,data1:docs,date_1});
				});
			//res.render('dashboard',{email});*/
			res.redirect('/Dashboard');
          }
	});
			
	});

});
app.get('/RegisterStudent',(req,res)=>{
	res.render('register');
});

app.post('/RegisterStudent',(req,res)=>{
	MongoClient.connect(url,{ useNewUrlParser: true },function(err,client){
		console.log("Inside Registration of Student..");

		const db = client.db(dbName);
		const collection = db.collection('Students');
		collection.insertOne(
			{
				Name: req.param('StdUsrName', null),
				Email : req.param('StdUsrEmail', null),
				Password : req.param('StdUsrPass', null),

			},function(err,result){
				res.redirect('/StudentDashboard');
		});


	});

});
app.get('/LoginStudent',(req,res)=>{
	res.render('login');
});

app.post('/LoginStudent',(req,res)=>{
	MongoClient.connect(url,{ useNewUrlParser: true },function(err,client){
		console.log("Trying to Login...");

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
				req.session.user = user;
			req.session.user.type = "Student";
			console.log(req.session.user);
            console.log(req.session.user.type);
            res.redirect('StudentDashboard');
          }
	});

	});

});




app.get('/MemberRecordsExaminers',(req,res)=>{
	MongoClient.connect(url,{ useNewUrlParser: true },function(err,client){
		console.log("Printing Data of Member Records Examiners");

		const db = client.db(dbName);
		const collection = db.collection('Examiners');
		collection.find({}).toArray(function(err,docs)
		{
			console.log(docs);
			res.render('MemberRecordsExaminers',{data:docs});

		});	
		client.close();
	});
});


app.get('/ExamInAction',checkStudent,(req,res)=>{
    MongoClient.connect(url,{ useNewUrlParser: true },function(err,client){
        let ExamId = req.query.ExamId.trim();
        console.log(ExamId);
		var mongo = require('mongodb');
		//var id = new mongo.ObjectId(ExamId);
        const db = client.db(dbName);
        const collection = db.collection('tests');
        collection.find({"t_id": ExamId}).toArray((err,docs)=>{
            docs[0].questions.forEach(element => {
                if(element.question.type == "o4")
                {
                    delete element.question.options.A.correct;
                    delete element.question.options.B.correct;
                    delete element.question.options.C.correct;
                    delete element.question.options.D.correct;
                }
                else if(element.question.type == "o2")
                {
                    delete element.question.options.A.correct;
                    delete element.question.options.B.correct;
                }
            });
            let Q_list = docs[0].questions;
            delete docs[0].questions;
            let exam_info = docs[0];
            let ExamData = {
                info : exam_info,
                Questions : Q_list
            };
            //console.log(ExamData);

            res.render('exam',{data:ExamData})
        });
    });


	
	
});

app.post('/getExam',(req,res)=>{
	MongoClient.connect(url,{ useNewUrlParser: true },function(err,client){
		//console.log("Printing Data of Member Records Students");
		
		const db = client.db(dbName);
		const collection = db.collection('tests');
		collection.find({"_id" : ObjectId('5cad023b7c41c361c5fdddc5')}).toArray(function(err,docs)
		{
		// 	app.use(bodyParser.urlencoded({ extended: false }));
		// 	app.use(bodyParser.json()); 
		// let some = docs[0].questions[0].question.options
		// delete some.A.correct;

		docs[0].questions.forEach(element => {
			if(element.question.type == "o4")
			{
				delete element.question.options.A.correct
				delete element.question.options.B.correct
				delete element.question.options.C.correct
				delete element.question.options.D.correct
			}
			else if(element.question.type == "o2")
			{
				delete element.question.options.A.correct
				delete element.question.options.B.correct				
			}
		});
			
			res.json(docs[0])

		});	
		client.close();
	});
});


app.get('/MemberRecordsStudents',(req,res)=>{
	MongoClient.connect(url,{ useNewUrlParser: true },function(err,client){
		console.log("Printing Data of Member Records Students");

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


app.get('/showtests',(req,res)=>{
	MongoClient.connect(url,{ useNewUrlParser: true },function(err,client){
		console.log("Showing tests");

		const db = client.db(dbName);
		const collection = db.collection('tests');
		collection.find().toArray(function(err,docs)
		{
			console.log(docs);
		});	
		client.close();
	});
})



app.post('/AddQuestions',checkFaculty,(req,res)=>{

	MongoClient.connect(url,{ useNewUrlParser: true },function(err,client){
		console.log("Inside Adding Questions");
		//var yo=
		//console.log(req.param('question_0', null));
		const db = client.db(dbName);
		const collection = db.collection('tests');
		var mongo = require('mongodb');
		var id=new mongo.ObjectID(req.cookies["id"]);
		var qns=parseInt(req.query.qns);
		//var qns=2;
		console.log(qns);
		console.log(id);
		console.log(req.cookies["id"]);
		for(var i=0;i<=qns;i++)
		{
			console.log("Loop Started");
			var yop='question_'+i;
			var finals=yop.concat(i);
			var select =req.param('select_'+i, null);
			console.log("Adding Question with options "+select);
			if(select==null)
			{
				continue;
			}
			else if(select==2)
			{

				collection.updateOne({_id:id}, {$push:{

					questions:
					{
						question:
						{
							type:"o2",

							value:req.param('question_'+i, null),
							options:
							{
								A:
								{
									value:req.param('option_1_'+i, null),
									correct:req.param('ACorrect_'+i, null)
								},
								B:
								{
									value:req.param('option_2_'+i, null),
									correct:req.param('BCorrect_'+i, null)
								}
							}
						}
					}

				}});
			}
			else
			{
				collection.updateOne({_id:id}, {$push:{

					questions:
					{
						question:
						{

							type:"o4",
							value:req.param('question_'+i, null),
							options:
							{
								A:
								{
									value:req.param('option_1_'+i, null),
									correct:req.param('ACorrect_'+i, null)
								},
								B:
								{
									value:req.param('option_2_'+i, null),
									correct:req.param('BCorrect_'+i, null)
								},
								C:
								{
									value:req.param('option_3_'+i, null),
									correct:req.param('CCorrect_'+i, null)
								},
								D:
								{
									value:req.param('option_4_'+i, null),
									correct:req.param('DCorrect_'+i, null)
								}
							}
						}
					}

				}});
			}
		}

		console.log("Questions Added redirected to Dashboard !!");
		res.redirect('/Dashboard');
		//res.clearCookie("id");

		client.close();
	});

});





//Httpserver Port Number 3000.

app.listen(process.env.PORT || 3000, function(){
  console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});

//Set The File Type To App As EJS.
app.set('view engine', 'ejs');
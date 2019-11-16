var app = require('express')();
var mysql = require('mysql');
var express=require('express');
var ejs = require('ejs');
app.set('view engine','ejs');
const bodyParser = require('body-parser');

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password:'rohit0203',
    database:'test'
});
connection.connect(function(error){
    if(error){
        console.log('Error');

    }
    else{
        console.log('Connected');

    }
});
function makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
 }
 
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

app.get('/admin_hu_main',(req,res)=>{
    res.render('admin',{status:'log'});
})
app.post('/createquiz',(req,res)=>{
    var link='localhost:8000/tests/'+makeid(6);
    connection.query('insert into test values(?,?,?)',[req.body.username,req.body.testname,link],(err,result,f)=>{
        if(err){
            res.send(err);
        }else{
            console.log("Successfully generated quiz");
            res.render('admin',{status:'quizcreation',username:req.body.username,testlink:link});
        }
    })

})
app.post('/createquiz2',(req,res)=>{
    var link='localhost:8000/tests/'+makeid(6);
    connection.query('insert into test values(?,?,?)',[req.body.username,req.body.testname,link],(err,result,f)=>{
        if(err){
            res.send(err);
        }else{
            console.log("Successfully generated quiz");
            connection.query('select * from questions',(err,result)=>{
                res.render('admin',{status:'quizcreation2',username:req.body.username,testlink:link,questions:result});
            })
            
        }
    })

})

app.post('/addques',(req,res)=>{
    connection.query('insert into questions values(?,?,?,?,?,?,?)',[req.body.question,req.body.option1,req.body.option2,req.body.option3,req.body.option4,req.body.rightanswer,req.body.testlink],(err,result)=>{
        if(err){
            res.send("Please try again");
        }else{
            connection.query('select * from questions where testlink =?',[req.body.testlink],(err,result1)=>{
                if(err){
                    res.send(err);
                }else{
                    res.render('admin',{status:'quizcreation',questions:result,username:req.body.username,testlink:req.body.testlink});
                }
            })
           
        }
    })
})
app.post('/addques2',(req,res)=>{
    connection.query('insert into questions values(?,?,?,?,?,?,?)',[req.body.question,req.body.option1,req.body.option2,req.body.option3,req.body.option4,req.body.rightanswer,req.body.testlink],(err,result)=>{
        if(err){
            res.send("Please try again");
        }else{
            connection.query('select * from questions',(err,result)=>{
                res.render('admin',{status:'quizcreation2',username:req.body.username,testlink:req.body.testlink,questions:result});
            })
           
        }
    })
})
app.post('/sharequiz',(req,res)=>{
    res.render('admin',{status:'share',link:req.body.link,username:req.body.username});
})

app.get('/tests/:id',(req,res)=>{
    console.log(req.originalUrl);
    connection.query('select * from questions where testlink=?',("localhost:8000"+req.originalUrl),(err,result)=>{
        
        if(err){
            res.send(err);
        }else{
            res.render('user',{status:'test',questions:result,score:0,msg:"All the best Let's see what you got!",questionNo:0,testlink:"localhost:8000"+req.originalUrl,username:'unknown'});
        }
    })
})
app.post('/login',(req,res)=>{
    connection.query('select * from admins where username=? and password=?',[req.body.username,req.body.password],(err,result)=>{
        console.log("object");
        if(result.length>0){
            
            connection.query('select testlink from test where username =?',[req.body.username],(err,result)=>{
                if(err){
                    res.send(err);
                }else
                res.render('admin',{status:'loggedin',links:result,username:req.body.username});
            })
            
        }else{
            res.send("Invalid Credentials");
        }
    })
})
app.post('/showattempts',(req,res)=>{
    connection.query('select * from attempts where testlink=?',[req.body.testlink],(err,result)=>{
        if(err){
            res.send(err);
        }else{
            res.render('admin',{status:'attempts',attempts:result,testlink:req.body.testlink,username:req.body.username});
        }
    })
})
app.post('/submit',(req,res)=>{
    connection.query('select * from questions where testlink=? and question=?',[req.body.testlink,req.body.question],(err,result,fields)=>{
        if(err){
            res.send(err);
        }else{
            if(result[0].rightanswer===req.body.rightanswer){
                connection.query('select * from questions where testlink=?',[req.body.testlink],(err,result)=>{
                    if(err){
                        res.send(err);
                    }else{
                        console.log(req.body.questionNo +" "+ result.length);
                        if(req.body.questionNo<result.length-1)
                        res.render('user',{status:'test',questions:result,testlink:req.body.testlink,score:( +req.body.score + 1),questionNo:( +req.body.questionNo + 1),msg:"Congrats that was a correct answer",username:req.body.username});
                        else{
                            console.log("score="+req.body.score);
                            connection.query('insert into attempts values(?,?,?)',[req.body.testlink,req.body.username,( +req.body.score +1)],(err,result)=>{
                                if(err){
                                    res.send(err);
                                }else{
                                    res.render('user',{status:'finalscore',score:(+req.body.score +1)});
                                }
                                })
                            

                            }
                        }
                    })
            }else{
                connection.query('select * from questions where testlink=?',[req.body.testlink],(err,result)=>{
                    console.log("Invalid Answer"+" "+req.body.testlink);
                    if(err){
                        res.send(err);
                    }else{
                        console.log("Invalid Answer"+" "+result.length+" "+result[0].question+" ");
                        if(req.body.questionNo<result.length-1){
                        res.render('user',{status:'test',testlink:req.body.testlink,questions:result,score:req.body.score,questionNo:( +req.body.questionNo + 1),msg:"Thats a wrong answer",username:req.body.username});
                        }
                        else{
                            connection.query('insert into attempts values(?,?,?)',[req.body.testlink,req.body.username,( +req.body.score)],(err,result)=>{
                                if(err){
                                    res.send(err);
                                }else{
                            res.render('user',{status:'finalscore',testlink:req.body.testlink,score:req.body.score});
                                }
                            });
                        }
                    }
                })
            }
        }
    })
})
app.listen(8000);
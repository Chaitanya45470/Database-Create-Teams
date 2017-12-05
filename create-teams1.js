let fs=require('fs');
let math=require('math');
let range=require('range');
let shuffle=require('shuffle-array');
let bodyParser=require('body-parser');
let express=require('express');
let app=express();
var mongo = require('mongodb');     
let teamsize,noOfStudents,res;

//connect to mongodb
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/mydb";
//set view engine to ejs
app.set('view engine','ejs');
//Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

app.use((req,res,next)=>{
    if(req.body.file_path==''||req.body.team_size==''||req.body.y_n==''){
        res.send('one or more fields are empty');
    }
    console.log('using middleware');
    next();
    
});


app.get('/',function(req,res){
    res.render('index',{
        title:'Team Creator',
        Warning:''
    });
});

app.post('/',function(req,res){
    fs.readFile(req.body.file_path,function(err,contents){
        let jsonContent = JSON.parse(contents);
        MongoClient.connect(url, function(err, db) {
            if (err) throw err;
            db.collection("customers").insertOne(jsonContent, function(err, res) {
                if (err) throw err;
                console.log(" inserted");
                 });
            db.collection("customers").findOne({},function(err,res){
            result=res;
            noOfStudents=0;
            for(let exKey in result.Aspirants) {
                noOfStudents+=1;
                    }                
            db.close();
                    });
                });
        if(req.body.team_size>0 && req.body.team_size<=noOfStudents && req.body.y_n==('y'||'Y')){
            teamsize=parseInt(req.body.team_size,10);
            if (err) { return onErr(err); }
            if(noOfStudents%teamsize === 0){
                noOfTeams=noOfStudents/teamsize;
                console.log("noOfTeams: "+noOfTeams+" with size "+teamsize);
                f();
    }
        else{
            noOfTeams=math.floor(noOfStudents/teamsize) +1;
            console.log(noOfTeams-1+" teams with size "+teamsize+" and 1 team with size "+(noOfStudents%teamsize));    
            console.log('creating teams');
            f();
    }
    function f(){
        let writeStream = fs.createWriteStream("teams.txt");
        let t=teamsize,i=0,exkey=range.range(0,noOfStudents);
        key=shuffle(exkey);
        for(let p=1;p<=noOfTeams;p++){
            writeStream.write("team"+p+"{"+"\n");
                while( i<t){
                    writeStream.write("student"+key[i]+"{"+"\n");
                    for(var exValue in result.Aspirants[key[i]]) {
                        writeStream.write(exValue+":"+result.Aspirants[key[i]][exValue]+"\n");
                            }
                    writeStream.write("}"+"\n");
                    i++;
                    if(i==noOfStudents){
                            break;
                            }
                    }               
                writeStream.write("*************************** \n");
                t=t+teamsize;
                        }
        console.log('teams created');
       
        res.writeHead(200,{'Content-Type':'text/plain'});
        let myReadStream=fs.createReadStream(__dirname+'/teams.txt','utf-8');
        myReadStream.pipe(res);
        writeStream = fs.createWriteStream("log.txt",{'flags':'a'});
        writeStream.write('We had visit at '+ new Date()+'\n');
        writeStream.end();
}
}
     else if(req.body.team_size<0 || req.body.team_size>noOfStudents){
                res.render('index1',{
                warning:`Please enter number between 1 and ${noOfStudents}`
        });
    }
    else if (req.body.y_n!='y'){
        res.send('<h1>Thank you!</h1>');
    }
});
});
    app.listen(3000,function(){
    console.log('listening');
});
    
'use strict';
const express = require('express');
const path = require('path');
// OR import express from 'express';

let currUser = -1;
let secrets;
let password;

let db = null;

if (!process.env.PASSWORD) {
    secrets = require('../secrets.json');
    password = secrets.password;
} else {
	password = process.env.PASSWORD;
}



const app = express();

app.use( '/' , express.static(path.join(__dirname ,'..')));

app.use( '/' , express.static(path.join(__dirname ,'..', '/auth')));

app.use(express.json()); // lets you handle JSON input


const { MongoClient, ObjectId } = require('mongodb');
const uri = "mongodb+srv://teams:"+password+"@teamsigma.kd2qp.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(async err => {

    if(err) throw err;

    db = client.db("StudyBuddy");

    console.log("We're in!");

    const port = process.env.PORT || 3000;

    app.listen(port, () => {
        console.log(`Example app listening at ${port}`);
    });

    // perform actions on the collection object
    //client.close();
});






async function readByID(idx, collection, res){

    let out = await collection.findOne({"_id": ObjectId(idx)});
    if (out === null) {
        res.status(404).send({err:"Invalid id"});
    } else {
        res.status(200).send(out);
    }
}

function addByID(idx, obj, member, val, res){
    if(idx in obj){
        if(!(val in obj[idx][member]))obj[idx][member].push(val);
        res.status(200).send(obj[idx][member]);
        
    }else{
        res.status(404).send({err:"Invalid id"});
    }
}

async function createNewObject(obj, collection, res){

    // let len = Object.keys(collection).length;

    // console.log("Saving object at id ", len);

    // collection[len] = obj;

    // res.status(200).send(collection);

    res.status(200).send(await collection.insertOne(obj));

}


/**
 * 
 * PAGE ENDPOINTS
 * 
 * 
 */

app.get('/', (req,res) => {
    res.sendFile(path.join(__dirname, "../auth/login.html"));
});

app.get('/test', (req,res) =>{
    res.sendFile(path.join(__dirname, "serverTests.html"));
});

/*
 * 
 * USER ENDPOINTS
 * 
 */


 /*
 * Create
 */
app.post('/user/create', (req, res) => {
    //req.body.groups = [];
    // req.body.courses = [];
    createNewObject(req.body, db.collection("User"), res);
});



 /*
 * Read
 */

app.post('/user/read/login', (req, res) => {

    let out = {status:401, body:{err:"Invalid credentials"}};

    for(let id in Object.keys(sampleUsers)){

        if(sampleUsers[id].email === req.body.email && sampleUsers[id].password === req.body.password){
            out.status = 200;
            out.body = {id: sampleUsers[id]};
            break;
        }
    }

    res.status(out.status).send(out.body);
});

app.get('/user/read/id/:user_id', (req, res) => {
    console.log("got to user by user id endpoint");
    readByID(req.params.user_id, sampleUsers, res);
});



 /*
 * Update
 */

app.post('/user/update/addGroup', (req, res) => {
    if (!(req.body.group_id in sampleUsers[req.body.user_id]["groups"])){
        addByID(req.body.user_id, sampleUsers, "groups", req.body.group_id, res);
    }
});

app.post('/user/update/addCourse', (req, res) => {
    addByID(req.body.user_id, sampleUsers, "courses", req.body.course_id, res);
});


app.post('/course/removeCourse', (req, res) => {
    if(req.body.user_id in sampleUsers){
        if(req.body.course_id in sampleUsers[req.body.user_id]){
            sampleUsers[req.body.user_id].courses = sampleUsers[req.body.user_id].courses.filter((id) => id !== req.body.course_id);
            sampleUsers[req.body.user_id].groups = sampleUsers[req.body.user_id].groups.filter((group_id) => !(group_id in sampleCourses[req.body.course_id].groups));
        }
        
        res.status(200).send(sampleUsers[req.body.use_id]);

    }else{
        res.status(404).send({err:"user does not exist"});
    }
    
});


/*
 * 
 * COURSE ENDPOINTS
 * 
 */

  /*
 * Create
 */

app.post('/course/create', async (req, res) => {

    // see if course with this ame already exists
    let dup = await db.collection("Classes").findOne({course_name:req.body.course_name});

    //if not, insert new course object
    if(dups === null){
        req.body.groups = [];
        createNewObject(req.body, sampleCourses, res);
    }else{
        res.status(200).send({msg:"course already exists"});
    }
  
});
  
  
  
/*
* Read
*/
  

app.get('/course/read/all', async (req, res) => {

    let out = await db.collection("Classes").find({}).toArray();

    console.log(out);
    
    if(out === null){
        res.status(404).send({err:"Not valid query response"});
    }

    res.status(200).send(out);
});

app.get('/course/read/:course_id', (req, res) => {
  
    readByID(req.params.course_id, db.collection("Classes"), res);
      
});


/*
 * 
 * GROUP ENDPOINTS
 * 
 */



 /*
 * Create
 */
app.post('/group/create', (req, res) => {

    sampleCourses[req.body.course_id].groups.push(Object.keys(sampleGroups).length);
    sampleUsers[req.body.created_by].groups.push(Object.keys(sampleGroups).length);
    req.body.member_ids = [req.body.created_by];

    sampleGroups[Object.keys(sampleGroups).length] = req.body;

    res.status(200).send(sampleUsers[req.body.created_by].groups);
  
});
  
  
  
/*
* Read
*/
  
app.get('/group/read/:group_id', (req, res) => {

    readByID(req.params.group_id, sampleGroups, res);
      
});
  
app.get('/group/search', (req, res) => {
  
    let courseGroups = sampleCourses[req.query.course_id].groups;
    res.status(200).send(courseGroups);
  
});
  
  
  
/*
* Update
*/
  
app.post('/group/update/addUser', (req, res) => {
  
    addByID(req.body.group_id, sampleGroups, "member_ids", req.body.user_id, res);
    
});



/*
* Delete
*/

app.post('/group/delete', (req, res) => {
  
    if(req.body.group_id in sampleGroups){
        delete sampleGroups[req.body.group_id];
        for (let user in sampleUsers){
            console.log("user: "+ user);
            sampleUsers[user].groups = sampleUsers[user].groups.filter((id) =>{
                console.log(id !== req.body.group_id);
                console.log(id);
                console.log(req.body.group_id);
                return id !== req.body.group_id;
            });
        }
        for (let course in sampleCourses){
            sampleCourses[course].groups = sampleCourses[course].groups.filter((id) => id !== req.body.group_id);
        }
        console.log(sampleUsers[req.body.user_id].groups);
        res.status(200).send(sampleUsers[req.body.user_id].groups);
    }else{
        res.status(200).send({msg:"group did not exist"});
    }
    
});

app.get('*', (req, res) => {
  res.status(404).send('NO FOOL, BAD COMMAND');
});

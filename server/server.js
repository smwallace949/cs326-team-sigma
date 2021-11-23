'use strict';
const express = require('express');
const path = require('path');
// OR import express from 'express';

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


const { MongoClient } = require('mongodb');
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
    // idx = parseInt(idx);
    // console.log("Reading ID", idx);
    // if(idx in data){
    //     res.status(200).send(data[idx]);
    // }else{
    //     res.status(404).send({err:"Invalid id"});
    // }

    let out = await collection.findOne({"_id": idx});
    if (out.length === 0) {
        res.status(404).send({err:"Invalid id"});
    } else {
        res.status(200).send(out);
    }
}

async function addByID(idx, collection, member, val, pushQuery, res){
    // if(idx in obj){
    //     if(!(val in obj[idx][member])) obj[idx][member].push(val);
    //     res.status(200).send(obj[idx][member]);
        
    // }else{
    //     res.status(404).send({err:"Invalid id"});
    // }
    let out = await collection.findOne({"_id": idx});
    if (out === null){
        res.status(404).send({err:"Invalid id"});
    } else {
        await collection.findOne({"_id":idx}, async function(err, result) {
            if (err) throw err;
            if (!(val in result[member])) {
                await collection.update({"_id":idx}, pushQuery);
                res.status(200).send(result[member]);
            }
        });
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
    req.body.groups = [];
    req.body.courses = [];
    createNewObject(req.body, db.collection("Users"), res); //missing s in users
});

 /*
  * Read
  */

app.get('/user/all', async (req, res) => {
    let out = await db.collection("Users").find({}).toArray();

    if(out === null){
        res.status(404).send({err:"Not valid query response"});
    }
    
    for(let id in out){
        let curObj = out[id];
        console.log(await db.collection("Users").findOne({"_id":curObj._id}, function(err, result) {
            if (err) throw err;
            let member = "groups";
            console.log(result[member]);
        }));
        // let val = 0;
        // let pushQuery = {$push: {"groups": val}};
        // await db.collection("Users").updateOne({"_id":curObj._id}, pushQuery);

        // await db.collection("Users").findOne({"_id":curObj._id}, function(err, result) {
        //     if (err) throw err;
        //     console.log(curObj._id);
        //     console.log(result.groups);
        //   });
    }
    res.status(200).send(out);
});

let curUserID = null;
let curUserObj = null;

app.post('/user/read/login', async (req, res) => {
    let out = {status:401, body:{err:"Invalid credentials"}};
    let users = await db.collection("Users").find({}).toArray();
    for(let id in users){
        let curObj = users[id];
        if(curObj.email === req.body.email && curObj.password === req.body.password){
            out.status = 200;
            out.body = curObj;
            curUserID = curObj._id;
            curUserObj = curObj;
            break;
        }
    }
    res.status(out.status).send(out.body);
});

app.get('/user/read/data', (req, res) => {
    res.status(400).send({id: curUserID, userObj: curUserObj});
});

app.get('/user/read/id/:user_id', (req, res) => {
    console.log("got to user by user id endpoint");
    readByID(req.params.user_id, db.collection("Users"), res);
});



 /*
 * Update
 */
app.post('/user/update/addGroup', (req, res) => {
    let pushQuery = {$push: {"groups": req.body.group_id}};
    addByID(req.body.user_id, db.collection("Users"), "groups", req.body.group_id, pushQuery, res);
});

app.post('/user/update/addCourse', (req, res) => {
    let pushQuery = {$push: {"courses": req.body.course_id}}; //should be courses not groups
    addByID(req.body.user_id, db.collection("Users"), "courses", req.body.course_id, pushQuery, res);
});

app.post('user/course/removeCourse', async (req, res) => {
    let collection = db.collection("Users");
    let userDocument = await collection.findOne({"_id":req.body.user_id});
    if (userDocument !== null) {
        let cid = req.body.course_id;
        let uid = req.body.user_id;
        let pullQuery = {$pull:{"courses":uid}}
        addByID(uid, collection, "courses", cid, pullQuery, res);
        //traverse through all groups -> if group is part of course, pull it
        res.status(200).send(userDocument);
    } else {
        res.status(404).send({err:"user does not exist"});
    }
    // if(req.body.user_id in sampleUsers){
    //     if(req.body.course_id in sampleUsers[req.body.user_id]){
    //         sampleUsers[req.body.user_id].courses = sampleUsers[req.body.user_id].courses.filter((id) => id !== req.body.course_id);
    //         sampleUsers[req.body.user_id].groups = sampleUsers[req.body.user_id].groups.filter((group_id) => !(group_id in sampleCourses[req.body.course_id].groups));
    //     }
        
    //     res.status(200).send(sampleUsers[req.body.use_id]);

    // }else{
    //     res.status(404).send({err:"user does not exist"});
    // }
    
});


/*
 * 
 * COURSE ENDPOINTS
 * 
 */

  /*
 * Create
 */

app.post('/course/create', (req, res) => {

    if(!(req.body.course_name in Object.values(sampleCourses.map((course) => course[course_name])))){
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
  
    readByID(req.params.course_id, sampleCourses, res);
      
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

    // sampleCourses[req.body.course_id].groups.push(Object.keys(sampleGroups).length);
    // sampleUsers[req.body.created_by].groups.push(Object.keys(sampleGroups).length);

    // req.body.member_ids = [req.body.created_by];
    // sampleGroups[Object.keys(sampleGroups).length] = req.body;
    // res.status(200).send(sampleUsers[req.body.created_by].groups);

    //IDEAS BELOW - WIP

    /*
    create a new group
    get course by course id, cast to ObjectID, add group to course
    get user by created by id,cast to ObjectID add group to user
    */
   
    req.body.user_ids = [req.body.created_by];
    let a = createNewObject(req.body, db.collection("Groups"), res);

    let pushQuery_class = {$push: {"groups": a.group_id}};
    addByID(req.body.course_id, db.collection("Classes"), "groups", a.group_id, pushQuery_class, res);

    let pushQuery_user = {$push: {"groups": a.group_id}};
    addByID(req.body.created_by, db.collection("Users"), "groups", a.group_id, pushQuery_user, res);
  
});
  
  
  
/*
* Read
*/
  
app.get('/group/read/:group_id', (req, res) => {
    readByID(req.params.group_id, db.collection("Groups"), res);

});
  
app.get('/group/search', async (req, res) => {  
    // let courseGroups = sampleCourses[req.query.course_id].groups;
    // need to get groups from a requested course

    let out = await db.collection("Groups").find({"course_id":req.body.course_id}).toArray();
    res.status(200).send(out);
  
});
  
  
  
/*
* Update
*/
  
app.post('/group/update/addUser', (req, res) => {
  
    // addByID(req.body.group_id, sampleGroups, "member_ids", req.body.user_id, res);
    
    let pushQuery = {$push: {"user_ids": req.body.user_id}};
    addByID(req.body.group_id, db.collection("Groups"), "user_ids", req.body.user_id, pushQuery, res);
    
});




/*
* Delete
*/

app.post('/group/delete', (req, res) => {
  
    // if(req.body.group_id in sampleGroups){
    //     delete sampleGroups[req.body.group_id];
    //     for (let user in sampleUsers){
    //         console.log("user: "+ user);
    //         sampleUsers[user].groups = sampleUsers[user].groups.filter((id) =>{
    //             console.log(id !== req.body.group_id);
    //             console.log(id);
    //             console.log(req.body.group_id);
    //             return id !== req.body.group_id;
    //         });
    //     }
    //     for (let course in sampleCourses){
    //         sampleCourses[course].groups = sampleCourses[course].groups.filter((id) => id !== req.body.group_id);
    //     }
    //     console.log(sampleUsers[req.body.user_id].groups);
    //     res.status(200).send(sampleUsers[req.body.user_id].groups);
    // }else{
    //     res.status(200).send({msg:"group did not exist"});
    // }
    
});

app.get('*', (req, res) => {
  res.status(404).send('NO FOOL, BAD COMMAND');
});

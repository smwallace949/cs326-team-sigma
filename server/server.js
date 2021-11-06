'use strict';
const express = require('express');
const path = require('path');
// OR import express from 'express';


let currUser = -1;

let sampleUsers = {};

let sampleGroups = {};

let sampleCourses = {};

const app = express();

app.use( '/' , express.static(path.join(__dirname ,'..')));

app.use( '/' , express.static(path.join(__dirname ,'..', '/auth')));


app.use(express.json()); // lets you handle JSON input

function readByID(idx, data, res){
    idx = parseInt(idx);
    console.log("Reading ID", idx);
    if(idx in data){
        res.status(200).send(data[idx]);
    }else{
        res.status(404).send({err:"Invalid id"});
    }
}

function updateByID(idx, data, modifier, res){
    if(idx in data){
        modifier(data[idx]);
        res.status(200).send(data[idx]);
    }else{
        res.status(404).send({err:"Invalid id"});
    }
}

function createNewObject(obj, collection, res){

    let len = Object.keys(collection).length;

    console.log("Saving object at id ", len);

    collection[len] = obj;

    res.status(200).send({msg:"New entry created"});

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
    createNewObject(req.body, sampleUsers, res);
  

});



 /*
 * Read
 */

app.post('/user/read/login', (req, res) => {

    let out = {status:401, body:{err:"Invalid credentials"}};

    for(let id in Object.keys(sampleUsers)){

        if(sampleUsers[id].email === req.body.email && sampleUsers[id].password === req.body.password){
            out.status = 200;
            out.body = sampleUsers[id];
            out.body.id = id;
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

    updateByID(req.body.user_id, sampleUsers, (user) => user.groups.push(req.body.group_id), res);
  
});

app.post('/user/update/addCourse', (req, res) => {

    updateByID(req.body.user_id, sampleUsers, (user) => user.courses.push(req.body.course_id), res);
  
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

    req.body.groups = [];
    createNewObject(req.body, sampleCourses, res);
  
});
  
  
  
/*
* Read
*/
  
app.get('/course/read/:course_id', (req, res) => {
  
    readByID(req.params.course_id, sampleCourses, res);
      
});

app.get('/course/read/all', (req, res) => {
  
    out = {};
    
    Object.keys(sampleCourses).forEach((id) => {
        out[id] = sampleCourses[id].course_name;
    });
    
    res.status(200).send(out);
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
    req.body.member_ids = [req.body.created_by];
    createNewObject(req.body, sampleGroups, res);
  
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
  
    updateByID(req.body.group_id, sampleGroups, (group) => group.member_ids.push(req.body.user_id), res);
    
});



/*
* Delete
*/

app.post('/group/delete', (req, res) => {
  
    if(req.body.group_id in sampleGroups){
        delete sampleGroups[req.body.group_id];
        for (let user in sampleUsers){
            sampleUsers[user].groups = sampleUsers[user].groups.filter((id) => id !== req.body.group_id);
        }
        for (let course in sampleCourses){
            sampleCourses[course].groups = sampleCourses[course].groups.filter((id) => id !== req.body.group_id);
        }
        res.status(200).send({msg:"group deleted"});
    }else{
        res.status(200).send({msg:"group did not exist"});
    }
    
});

app.get('*', (req, res) => {
  res.status(404).send('NO FOOL, BAD COMMAND');
});

const port = process.env.PORT || 3000

app.listen(port, () => {
    console.log(`Example app listening at ${port}`);
});

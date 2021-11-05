'use strict';
const express = require('express');
// OR import express from 'express';


let sampleUsers = {};

let sampleGroups = {};

let sampleCourses = {};



const app = express();

app.use(express.json()); // lets you handle JSON input

const port = 3000;

function readByID(idx, data, res){
    if(idx > -1 && idx < data.length){
        res.status(200).send(data[idx]);
    }else{
        res.status(404).send({err:"Invalid id"});
    }
}

function updateByID(idx, data, modifier, res){
    if(idx > -1 && idx < data.length){
        modifier(data[idx]);
        res.status(200).send(data[idx]);
    }else{
        res.status(404).send({err:"Invalid id"});
    }
}
function createNewObject(obj, collection, res){
    let len = Object.keys(collection).length;

    collection[len] = obj;

    res.status(200).send({msg:"New entry created"});

}

/*
 * 
 * USER ENDPOINTS
 * 
 */


 /*
 * Create
 */
app.post('/user/create', (req, res) => {

  sampleUsers.push(req.body);

  res.status(200).send({msg:"New user Created"});

});



 /*
 * Read
 */

app.get('/user/:email/:password', (req, res) => {

    let out = {status:401, body:{err:"Invalid credentials"}};

    sampleUsers.forEach((user)=>{
        if(user.username === req.body.username && user.password === req.body.password){
            out.status = 200;
            out.body = user;
        }
    });

    res.status(out.status).send(out.body);
});

app.get('/user/:user_id', (req, res) => {

    readByID(req.params.user_id, sampleUsers, res);

});



 /*
 * Update
 */

app.post('/user/addGroup', (req, res) => {

    updateByID(req.body.user_id, sampleUsers, (user) => user.groups.push(req.body.group_id), res);
  
});

app.post('/user/addCourse', (req, res) => {

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

    sampleCourses.push(req.body);

    res.status(200).send({msg:"New course Created"});
  
});
  
  
  
/*
* Read
*/
  
app.get('/course/:course_id', (req, res) => {
  
    readByID(req.params.course_id, sampleCourses, res);
      
});


/*
 * 
 * USER ENDPOINTS
 * 
 */



 /*
 * Create
 */
app.post('/group/create', (req, res) => {

    sampleGroups.push(req.body);

    res.status(200).send({msg:"New group Created"});
  
});
  
  
  
/*
* Read
*/
  
app.get('/group/:group_id', (req, res) => {
  
    readByID(req.params.group_id, sampleGroups, res);
      
});
  
app.get('/group/search', (req, res) => {
  
    let courseGroups = sampleCourses[req.query.course_id].groups;
    res.status(200).send(courseGroups);
  
});
  
  
  
/*
* Update
*/
  
app.post('/group/addUser', (req, res) => {
  
    updateByID(req.body.group_id, sampleGroups, (group) => group.member_ids.push(req.body.user_id), res);
    
});



/*
* Delete
*/

app.post('/group/delete', (req, res) => {
  
    if(req.body.group_id in sampleGroups){
        delete sampleGroups[req.body.group_id];
        for (let user in sampleUsers){
            user.groups = user.groups.filter((id) => id !== req.body.group_id);
        }
        for (let course in sampleCourses){
            course.groups = course.groups.filter((id) => id !== req.body.group_id);
        }
    }
    
});

app.get('*', (req, res) => {
  res.send('NO FOOL, BAD COMMAND');
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});

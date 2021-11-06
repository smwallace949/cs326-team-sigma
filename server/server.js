'use strict';
const express = require('express');
const path = require('path');
// OR import express from 'express';


let currUser = -1;

// let sampleUsers = {
//     0: {name:'Alan Castillo', email: "aacastillo@umass.edu", linkedIn: 'aacastillo', groups: [0,1,2], courses: [1, 0]},
//     1: {name:'Elisavet Philippakis', email: "ephilippakis@umass.edu"},
//     2: {name:'Sam Wallace', email: "swallace@umass.edu", password = "12345"}
// };

// let sampleCourses = {
//     0: {course_name: 'CS345', professors: ['Jaime Davila', 'Marco Serafini'], groups:[]}, 
//     1: {course_name:'CS326', professors: ['Emery Berger'], groups:[]}, 
//     2: {course_name:'CS220', professors: ['Marius Minea'], groups:[]},
//     3: {course_name: 'CS383', professors: ['Mathew Rattigan'], groups:[]}
// };

// let sampleGroups = {
//     0: {created_by: 'Alan', 
//         name: 'Night Grinders1',
//         meetings_days: ['Teus', 'Wed', 'Thurs'],
//         course_name: 'CS326',
//         prof_name: 'Emery Berger',
//         max_size: 3,
//         member_ids: [0,1,2]
//     },
//     1: {created_by: 'Alan', 
//         name: 'CodeTrek1',
//         meetings_days: ['Teus', 'Wed', 'Thurs'],
//         course_name: 'CS326',
//         prof_name: 'Emery Berger',
//         max_size: 4,
//         member_ids: [0,1,2]
//     },
//     2: {
//         created_by: 'Alan', 
//         name: 'JavaSip1',
//         meetings_days: ['Teus', 'Wed', 'Thurs'],
//         course_name: 'CS326',
//         prof_name: 'Jaime Davila',
//         max_size: 4,
//         member_ids: [0,1,2]
//     }
// }

let sampleUsers = {};

let sampleCourses = {};

let sampleGroups = {};

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

function addByID(idx, obj, member, val, res){
    if(idx in obj){
        if(!(val in obj[idx][member]))obj[idx][member].push(val);
        res.status(200).send(obj[idx][member]);
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

    addByID(req.body.user_id, sampleUsers, "groups", req.body.group_id, res);
  
});

app.post('/user/update/addCourse', (req, res) => {

    addByID(req.body.user_id, sampleUsers, "courses", req.body.course_id, res);
  
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
  
    addByID(req.body.group_id, sampleGroups, "member_ids", req.body.user_id, res);
    
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

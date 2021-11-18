'use strict';
const express = require('express');
const path = require('path');
// OR import express from 'express';

let currUser = -1;
let secrets;
let password;
if (!process.env.PASSWORD) {
    secrets = require('../secrets.json');
    password = secrets.password;
} else {
	password = process.env.PASSWORD;
}

const { MongoClient } = require('mongodb');
const uri = "mongodb+srv://teams:"+password+"@teamsigma.kd2qp.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const classes = client.db("StudyBuddy").collection("Classes");
    //console.log(classes.s.db);
    //let a =  classes.find({"course_name": "Web Programming"});
    //console.log(a);

    const groups = client.db("StudyBuddy").collection("Groups");
    const users = client.db("StudyBuddy").collection("Users");
    console.log("We're in!");
    // perform actions on the collection object
    client.close();
});

let sampleUsers = {
    0: {name:'Alan Castillo', email: "aacastillo@umass.edu", password: "password", linkedIn: 'aacastillo', groups: [0,2,4,5], courses: [0,1,3]},
    1: {name:'Elisavet Philippakis', password: "password", email: "ephilippakis@umass.edu", groups:[1,2,6,8,9,10]},
    2: {name:'Sam Wallace', password: "password", email: "swallace@umass.edu", password: "12345", groups:[1,2,3,4,6,7,8,9,10]}
};

let sampleCourses = {
    0: {course_name: 'CS345', professors: ['Jaime Davila', 'Marco Serafini'], groups:[0,1,2,3]}, 
    1: {course_name:'CS326', professors: ['Emery Berger'], groups:[4,5,6]}, 
    2: {course_name:'CS220', professors: ['Marius Minea'], groups:[7,8]},
    3: {course_name: 'CS383', professors: ['Matthew Rattigan'], groups:[9,10]} //2 groups
};

let sampleGroups = {
    0: {created_by: 'Alan Castillo', 
        name: 'Jumpstart 345',
        meetings_days: ['Teus', 'Wed', 'Thurs'],
        course_name: 'CS345',
        prof_name: 'Marco Serafini',
        max_size: 2,
        member_ids: [0]
    },
    1: {created_by: 'Sam Wallace', 
        name: '345 Galatica',
        meetings_days: ['Mon', 'Thurs'],
        course_name: 'CS345',
        prof_name: 'Marco Serafini',
        max_size: 3,
        member_ids: [1,2]
    },
    2: {
        created_by: 'Alan Castillo', 
        name: 'StarQL',
        meetings_days: ['Teus', 'Thurs'],
        course_name: 'CS345',
        prof_name: 'Jaime Davila',
        max_size: 4,
        member_ids: [0,1,2]
    },
    3: {
        created_by: 'Sam Wallace', 
        name: 'El DB',
        meetings_days: ['Teus', 'Wed', 'Thurs'],
        course_name: 'CS345',
        prof_name: 'Jaime Davila',
        max_size: 4,
        member_ids: [2]
    },
    4: {
        created_by: 'Alan Castillo', 
        name: 'Web Crawlers',
        meetings_days: ['Teus', 'Wed', 'Thurs'],
        course_name: 'CS326',
        prof_name: 'Emery Berger',
        max_size: 3,
        member_ids: [0,2]
    },
    5: {
        created_by: 'Alan Castillo', 
        name: 'Cookie Monster',
        meetings_days: ['Teus', 'Thurs'],
        course_name: 'CS326',
        prof_name: 'Emery Berger',
        max_size: 2,
        member_ids: [0]
    },
    6: {
        created_by: 'Sam Wallace', 
        name: 'Node Noobs',
        meetings_days: ['Teus', 'Wed', 'Thurs', 'Friday'],
        course_name: 'CS326',
        prof_name: 'Emery Berger',
        max_size: 7,
        member_ids: [1,2]
    },
    7: {
        created_by: 'Sam Wallace', 
        name: 'Help',
        meetings_days: ['Teus'],
        course_name: 'CS220',
        prof_name: 'Marius Minea',
        max_size: 3,
        member_ids: [2]
    },
    8: {
        created_by: 'Alan Castillo', 
        name: 'Functional Warzone',
        meetings_days: ['Teus', 'Wed', 'Thurs', 'Friday'],
        course_name: 'CS220',
        prof_name: 'Marius Minea',
        max_size: 9,
        member_ids: [0,1,2]
    },
    9: {
        created_by: 'Sam Wallace', 
        name: 'neuralink bots',
        meetings_days: ['Mon', 'Teus', 'Wed', 'Thurs', 'Friday'],
        course_name: 'CS383',
        prof_name: 'Matthew Rattigan',
        max_size: 5,
        member_ids: [1,2]
    },
    10: {
        created_by: 'Sam Wallace', 
        name: '1984',
        meetings_days: ['Teus', 'Wed', 'Thurs', 'Friday'],
        course_name: 'CS383',
        prof_name: 'Matthew Rattigan',
        max_size: 3,
        member_ids: [1,2]
    }
}

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

    res.status(200).send(collection);

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
  

app.get('/course/read/all', (req, res) => {
  
    let out = {};
    
    Object.keys(sampleCourses).forEach((id) => {
        out[id] = sampleCourses[id].course_name;
    });
    
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

const port = process.env.PORT || 3000

app.listen(port, () => {
    console.log(`Example app listening at ${port}`);
});

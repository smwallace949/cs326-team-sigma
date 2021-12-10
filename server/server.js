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

async function addByID(idx, collection, member, val, pushQuery, res){
    
    //BUG when the member is a list of object ids, fuction cannot determine when an id is in the arrary already
    
    
    // if(idx in obj){
    //     if(!(val in obj[idx][member])) obj[idx][member].push(val);
    //     res.status(200).send(obj[idx][member]);
        
    // }else{
    //     res.status(404).send({err:"Invalid id"});
    // }
    idx = ObjectId(idx);
    let out = await collection.findOne({"_id": idx});
    if (out === null){
        res.status(404).send({err:"Invalid id"});
    } else {
        await collection.findOne({"_id":idx}, async function(err, result) {
            if (err) throw err;

            let objExists = false;

            console.log("adding ID to member");

            console.log(JSON.stringify(result[member]));

            for (let id in result[member]){

                console.log(val.toString());
                console.log(result[member][id].toString());

                //DOES NOT WORK AT THIS TIME
                if (val.toString() === result[member][id].toString()){
                    objExists = true;
                    console.log("Successfully prevented duplication of IDs!");
                    break;
                }

            }

            //if object is already in array
            if (objExists) {
                await collection.findOneAndUpdate({"_id":idx}, pushQuery, {returnDocument: "after"}, async (err, result)=>{
                    if (err) throw err;
                    res.status(200).send(result.value[member]);
                });
            }else{
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
    res.status(out.status).send(out.body)
});

app.get('/user/read/data', (req, res) => {
    res.status(200).send({"id": curUserID, "userObj": curUserObj});
});

app.get('/user/read/id/:user_id', (req, res) => {
    console.log("got to user by user id endpoint");
    readByID(req.params.user_id, db.collection("Users"), res);
});



 /*
 * Update
 */
app.post('/user/update/addGroup', (req, res) => {
    let pushQuery = {$push: {"groups": ObjectId(req.body.group_id)}};
    addByID(req.body.user_id, db.collection("Users"), "groups", ObjectId(req.body.group_id), pushQuery, res);
});

app.post('/user/update/addCourse', (req, res) => {
    let pushQuery = {$push: {"courses": ObjectId(req.body.course_id)}}; //should be courses not groups
    addByID(req.body.user_id, db.collection("Users"), "courses", ObjectId(req.body.course_id), pushQuery, res);
});

app.post('user/update/removeCourse', async (req, res) => {

    let pullCourseQuery = {$pull:{"courses":req.body.course_id}};
    let pullGroupsQuery = {$pull:{"groups":{course_id:ObjectId(req.body.course_id)}}};


    //remove group ids
    await collection.findOneAndUpdate({_id:req.body.user_id},pullGroupsQuery);

    //remove course ids and send modified user object
    await collection.findOneAndUpdate({_id:req.body.user_id},pullCourseQuery,{returnDocument:"after"}, async(err, result)=>{

        if(err){
            res.status(404).send(null);
            throw err;
        }

        if (result.value === null){
            res.status(400).send(null);
        }else{
            res.status(200).send(result.value);
        }
    });
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

app.post('/course/create', async (req, res) => {

    // see if course with this ame already exists
    let dups = await db.collection("Classes").findOne({course_name:req.body.course_name});

    //if not, insert new course object
    if(dups === null){
        req.body.groups = [];
        createNewObject(req.body, sampleCourses, res);
    }else{
        res.status(200).send({msg:"course already exists"});
    }
   //{ackowledge: 10, insertID: askldjflkdsj}
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
app.post('/group/create', async (req, res) => {

    // sampleCourses[req.body.course_id].groups.push(Object.keys(sampleGroups).length);
    // sampleUsers[req.body.created_by].groups.push(Object.keys(sampleGroups).length);

    // sampleGroups[Object.keys(sampleGroups).length] = req.body;
    // res.status(200).send(sampleUsers[req.body.created_by].groups);

    //IDEAS BELOW - WIP

    /*
    create a new group
    get course by course id, cast to ObjectID, add group to course
    get user by created by id,cast to ObjectID add group to user
    */

    req.body.created_by = ObjectId(req.body.created_by);
    req.body.course_id = ObjectId(req.body.course_id);

    let res_obj = await db.collection("Groups").insertOne(req.body);
    let group_id = res_obj.insertedId;

    console.log("Insertion Response: " + JSON.stringify(res_obj));
    console.log("Created Group ID: " + group_id);

    let pushQuery_class = {$push: {"group_ids": group_id}};
    await db.collection("Classes").findOne({"_id": ObjectId(req.body.course_id)}, async function(err, result) {
        if (err) throw err;
        await db.collection("Classes").update({"_id": ObjectId(req.body.course_id)}, pushQuery_class);
    });

    let pushQuery_user = {$push: {"groups": group_id}};
    await db.collection("Users").findOne({"_id": ObjectId(req.body.created_by)}, async function(err, result) {
        if (err) throw err;
        await db.collection("Users").update({"_id": ObjectId(req.body.created_by)}, pushQuery_user);
        let updatedUsers = await db.collection("Users").findOne({"_id": ObjectId(req.body.created_by)});
        res.status(200).send(updatedUsers.groups);
    });  
});
  
  
  
/*
* Read
*/
  
app.get('/group/read/:group_id', (req, res) => {
    readByID(req.params.group_id, db.collection("Groups"), res);

});
  
app.post('/group/search', async (req, res) => {  
    // let courseGroups = sampleCourses[req.query.course_id].groups;
    // need to get groups from a requested course

    let out = await db.collection("Groups").find(req.body).toArray();
    res.status(200).send(out);
  
});
  
  
  
/*
* Update
*/
  
app.post('/group/update/addUser', (req, res) => {
  
    // addByID(req.body.group_id, sampleGroups, "member_ids", req.body.user_id, res);
    
    let pushQuery = {$push: {"user_ids": ObjectId(req.body.user_id)}};
    addByID(req.body.group_id, db.collection("Groups"), "user_ids", ObjectId(req.body.user_id), pushQuery, res);
    
});




/*
* Delete
*/

app.post('/group/delete', async (req, res) => {
  
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

    let user = await db.collection("Users").findOne({_id:ObjectId(req.body.user_id)});
    let group = await db.collection("Groups").findOne({_id:ObjectId(req.body.group_id)});

    if (user === null || group === null){
        if(user === null)console.log("ERROR: undefined user. Passed user ID: " + req.body.user_id);
        if (group === null) console.log("ERROR: undefined group. Passed group ID: " + req.body.group_id);

        res.status(400).send([]);
        return;
    }

    //Why are we deleting many here? should each group appear once in Groups?
    let deletedCount = (await db.collection("Groups").deleteMany({_id:ObjectId(req.body.group_id)})).deletedCount;

    console.log("deleted count: " + deletedCount);
    if (deletedCount > 0){

        const coursePullQuery = {$pull: {"group_ids": ObjectId(req.body.group_id)}};
        const userPullQuery = {$pull: {"groups": ObjectId(req.body.group_id)}};

        await db.collection("Classes").findOneAndUpdate({_id:ObjectId(group.course_id)}, coursePullQuery);

        //Potential bug here? check
        const updateResult = await db.collection("Users").updateMany({}, userPullQuery);

        if (updateResult.modifiedCount > 0){
            
            console.log("Modified group arrays effectively");

            user = await db.collection("Users").findOne({_id:ObjectId(req.body.user_id)});
        }

        console.log("Modified Count: " + updateResult.modifiedCount);

    }
    res.status(200).send(user.groups);
});

app.get('*', (req, res) => {
  res.status(404).send('NO FOOL, BAD COMMAND');
});

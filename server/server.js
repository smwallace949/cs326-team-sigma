'use strict';
const express = require('express');
const path = require('path');
// OR import express from 'express';

//define credential vars
let secrets;
let password;
let db = null;

//set password based on process environment
if (!process.env.PASSWORD) {
    secrets = require('../secrets.json');
    password = secrets.password;
} else {
	password = process.env.PASSWORD;
}


//init express app
const app = express();

app.use( '/' , express.static(path.join(__dirname ,'..')));

app.use( '/' , express.static(path.join(__dirname ,'..', '/auth')));

app.use(express.json()); // lets you handle JSON input

//init connection to DB, startup server in callback
const { MongoClient, ObjectId } = require('mongodb');
const uri = "mongodb+srv://teams:"+password+"@teamsigma.kd2qp.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(async err => {

    if(err){ throw err;}

    db = client.db("StudyBuddy");

    const port = process.env.PORT || 3000;

    app.listen(port, () => {
        console.log(`App listening at ${port}`);
    });

});





/*
*readById(idx: String, collection: MongoClient.Collection, res: HTTPResponse)
*
*Given a MongoDB objectId idx (uncasted), read the corresponding document from collection and send it in res
*/
async function readByID(idx, collection, res){

    const out = await collection.findOne({"_id": ObjectId(idx)});  
    if (out === null) {
        res.status(404).send({err:"Invalid id"});
    } else {
        res.status(200).send(out);
    }
}


/*
*addById(idx: String, collection: MongoClient.Collection, member: String, val: ObjectId, pushQuery: MongoClient.UpdateFlter res: HTTPResponse)
*
*Given a MongoDB objectId idx (uncasted), update member in idx with UpdateFilter pushquery and return the updated member in res.
*/
async function addByID(idx, collection, member, val, pushQuery, res){

    //cast object id string
    idx = ObjectId(idx);

    //find correspoding document
    await collection.findOne({"_id":idx}, async function(err, result) {

        //if not fetched, throw error and return 400 level status code
        if (err){
            res.status(404).send("Bad Request");
            throw err;
        }

        if (result === null){
            res.status(400).send('Invalid object id');
        }
        
        //var for if the id being added to the member array is already there
        let objExists = false;
        for (const id in result[member]){

            if (val.toString() === result[member][id].toString()){
                objExists = true;
                console.log("Successfully prevented duplication of IDs!");
                break;
            }

        }

        //if object is not already in array
        if (!objExists) {

            console.log(`adding ID ${val} to member ${member} of document ${idx}`);

            //return updated member list
            await collection.findOneAndUpdate({"_id":idx}, pushQuery, {returnDocument: "after"}, async (err, result)=>{
                if (err){ throw err;}
                res.status(200).send(result.value[member]);
            });

        }else{
            res.status(200).send(result[member]);
        }
    });
}
/*
*createNewObject(obj: Object, collection: MongoClient.Collection, res: HTTPResponse)
*
*Given an Object obj, add to collection and send response from DB in res.
*/
async function createNewObject(obj, collection, res){

    res.status(200).send(await collection.insertOne(obj));

}


/**
 * 
 * PAGE ENDPOINTS
 * 
 * 
 */


//if root of url, go to login screen
app.get('/', (req,res) => {
    res.sendFile(path.join(__dirname, "../auth/login.html"));
});


//route to test page to run server tests.
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

    //add group and course member arrays
    req.body.groups = [];
    req.body.courses = [];

    //add to users collection
    createNewObject(req.body, db.collection("Users"), res);
});

 /*
  * Read
  */

//gloabl server variables for storing current session user (very hacky lmao)
let curUserID = null;
let curUserObj = null;

//get user document based on login info
app.post('/user/read/login', async (req, res) => {

    //default return val is an invalid login
    const out = {status:401, body:{err:"Invalid credentials"}};

    //collect all users, find on with matching credentials, return in response
    const users = await db.collection("Users").find({}).toArray();
    for(const id in users){
        const curObj = users[id];
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

//sends current session user's data to frontend
app.get('/user/read/data', (req, res) => {
    res.status(200).send({"id": curUserID, "userObj": curUserObj});
});

//get user by id
app.get('/user/read/id/:user_id', (req, res) => {
    readByID(req.params.user_id, db.collection("Users"), res);
});



 /*
 * Update
 */

 //update user's group list with new group id
app.post('/user/update/addGroup', (req, res) => {

    const pushQuery = {$push: {"groups": ObjectId(req.body.group_id)}};

    addByID(req.body.user_id, db.collection("Users"), "groups", ObjectId(req.body.group_id), pushQuery, res);
});

//update user's course list by adding course id
app.post('/user/update/addCourse', (req, res) => {
    const pushQuery = {$push: {"courses": ObjectId(req.body.course_id)}}; //should be courses not groups

    addByID(req.body.user_id, db.collection("Users"), "courses", ObjectId(req.body.course_id), pushQuery, res);

});

/*
 * 
 * COURSE ENDPOINTS
 * 
 */

  /*
 * Create
 */


 //creates a new course
app.post('/course/create', async (req, res) => {

    // see if course with this ame already exists
    const dups = await db.collection("Classes").findOne({course_name:req.body.course_name});

    //if not, insert new course object
    if(dups === null){
        req.body.groups = [];
        createNewObject(req.body, db.collection("Classes"), res);
    }else{
        res.status(200).send({msg:"course already exists"});
    }
});
  
  
  
/*
* Read
*/
  
//retruns all course documents, for when user wants to join a new course.
app.get('/course/read/all', async (req, res) => {

    const out = await db.collection("Classes").find({}).toArray();
    
    if(out === null){
        res.status(404).send({err:"Not valid query response"});
    }

    res.status(200).send(out);
});

//read course by id
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

 //create a new group
app.post('/group/create', async (req, res) => {

    /*
    create a new group
    get course by course id, cast to ObjectID, add group to course
    get user by created by id,cast to ObjectID add group to user
    */

    //add members to group object related to the databse IDs
    req.body.created_by = ObjectId(req.body.created_by);
    req.body.course_id = ObjectId(req.body.course_id);

    //add group to DB
    const res_obj = await db.collection("Groups").insertOne(req.body);

    //new group's id
    const group_id = res_obj.insertedId;

    console.log("Insertion Response: " + JSON.stringify(res_obj));
    console.log("Created Group ID: " + group_id);

    //update class document for which this group is  part of
    const pushQuery_class = {$push: {"group_ids": group_id}};
    await db.collection("Classes").findOne({"_id": ObjectId(req.body.course_id)}, async function(err) {
        if (err){ throw err;}
        await db.collection("Classes").update({"_id": ObjectId(req.body.course_id)}, pushQuery_class);
    });

    //update user document of user that created document
    const pushQuery_user = {$push: {"groups": group_id}};
    await db.collection("Users").findOne({"_id": ObjectId(req.body.created_by)}, async function(err) {
        if (err){ throw err;}
        await db.collection("Users").update({"_id": ObjectId(req.body.created_by)}, pushQuery_user);
        const updatedUsers = await db.collection("Users").findOne({"_id": ObjectId(req.body.created_by)});
        res.status(200).send(updatedUsers.groups);
    });  
});
  
  
  
/*
* Read
*/
  
//get group by id
app.get('/group/read/:group_id', (req, res) => {
    readByID(req.params.group_id, db.collection("Groups"), res);
});
  
  
  
/*
* Update
*/
  

//add user to group member list
app.post('/group/update/addUser', (req, res) => {
    
    const pushQuery = {$push: {"user_ids": ObjectId(req.body.user_id)}};
    addByID(req.body.group_id, db.collection("Groups"), "user_ids", ObjectId(req.body.user_id), pushQuery, res);
    
});




/*
* Delete
*/


//delete
app.post('/group/delete', async (req, res) => {

    //get user and group objects for user that is requesting to delete the group
    let user = await db.collection("Users").findOne({_id:ObjectId(req.body.user_id)});
    const group = await db.collection("Groups").findOne({_id:ObjectId(req.body.group_id)});

    //if the user or group does not exist, return an empty updated groups list
    if (user === null || group === null){
        if(user === null){console.log("ERROR: undefined user. Passed user ID: " + req.body.user_id);}
        if (group === null){ console.log("ERROR: undefined group. Passed group ID: " + req.body.group_id);}

        res.status(400).send([]);
        return;
    }

    //delete group, return number of groups deleted to ensure it is more than 0 (delete many for when we had duplicate groups)
    const deletedCount = (await db.collection("Groups").deleteMany({_id:ObjectId(req.body.group_id)})).deletedCount;

    //if group is deleted
    if (deletedCount > 0){

        //update ops for course and users that this group was a part of
        const coursePullQuery = {$pull: {"group_ids": ObjectId(req.body.group_id)}};
        const userPullQuery = {$pull: {"groups": ObjectId(req.body.group_id)}};

        //update course
        await db.collection("Classes").findOneAndUpdate({_id:ObjectId(group.course_id)}, coursePullQuery);

        //update users
        const updateResult = await db.collection("Users").updateMany({}, userPullQuery);

        //if more than one user has their member list modififed
        if (updateResult.modifiedCount > 0){

            //refetch user var to contain updated group list
            user = await db.collection("Users").findOne({_id:ObjectId(req.body.user_id)});
        }

    }
    //return updated group list
    res.status(200).send(user.groups);
});

app.get('*', (req, res) => {
  res.status(404).send('NO FOOL, BAD COMMAND');
});

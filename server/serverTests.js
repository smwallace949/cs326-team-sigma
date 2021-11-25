//const url = "https://shielded-spire-81354.herokuapp.com"; //for deployment
const url  = "http://localhost:3000";//for local testing (npm start)



async function fetchDefaultReturn(url, params){
    return await fetch(url, params)
    .then(async res => {
        if(!res.ok)throw new Error(res.status);
        return await res.json();
    }).then((res)=>{
        return res;
    })
    .catch((err) => {
        console.log(err);
    });
}


async function tests(){

    //DONT TEST THIS WITH PERSISTING DB

    // let newUserReq = await fetchDefaultReturn(url+'/user/create', {
    //     method: 'POST',
    //     headers: {
    //         'Content-Type': 'application/json',
    //     },
    //     body:JSON.stringify(data)
    // // }).then(res=>res).catch(err => err);

    // console.log(newUserReq);

    let user = await fetchDefaultReturn(url+'/user/read/login',{ // GET USER INFO GIVEN LOGIN
        method:'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body:JSON.stringify({
            'email':"smwallace@umass.edu",
            'password':'password'
        })
    }).then(res=>res).catch(err => err);

    console.log(user);

    let userIdReq = await fetchDefaultReturn(url + `/user/read/id/${user._id}`) // GET USER INFO GIVEN ID
    .then(res=>res).catch(err => err);

    console.assert(userIdReq.email === user.email)

    console.log(userIdReq);

    let courseReq = await fetchDefaultReturn(url+`/course/read/${user.courses[0]}`).then(res=>res).catch(err => err); //GET COURSE INFO USER IS IN

    console.log(courseReq);

    let addCourseReq = await fetchDefaultReturn(url + '/user/update/addCourse', { //ADD THIS COURSE TO THE USER (purposefully fails)
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body:JSON.stringify({user_id: user._id, course_id:courseReq._id})
    }).then(res=>res).catch(err => err);

    console.log(addCourseReq);

    console.log("# of user's groups:\n" + user.groups.length);

    let groupsBeforeCommit = user.groups.length;

    user.groups = await fetchDefaultReturn(url + '/group/create', { //CREATE A NEW GROUP
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body:JSON.stringify({created_by:user._id, name:"Java Beans", course_id:courseReq._id, min_size: 2, max_size:10})
    }).then(res=>res).catch(err => err);

    let groupsAfterCommit = user.groups.length;

    console.log("# of user's groups after creating new one:\n" + user.groups.length);

    if (groupsAfterCommit > groupsBeforeCommit){

        let group = await fetchDefaultReturn(url+`/group/read/${user.groups[user.groups.length-1]}`).then(res=>res).catch(err => err);//READ GROUP INFO FROM ID

        console.log("Created Group ID:\n" + group._id);

        let addGroupReq = await fetchDefaultReturn(url+'/user/update/addGroup', {//ADD GROUP TO USER (does nothing)
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body:JSON.stringify({user_id: user._id, group_id:group._id})
        }).then(res=>res).catch(err => err);

        console.log(addGroupReq);

        let addMemberReq = await fetchDefaultReturn(url+'/group/update/addUser', { //ADD USER TO GROUP (does nothing)
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body:JSON.stringify({user_id: user._id, group_id:group._id})
        }).then(res=>res).catch(err => err);

        console.log(addMemberReq);


        let searchGroupReq = await fetchDefaultReturn(url+'/group/search', { //SERCH FOR GROUPS IN COURSE
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body:JSON.stringify({course_id: courseReq._id})
        }).then(res=>res).catch(err => err);

        console.log(searchGroupReq);


        let deleteGroupReq = await fetchDefaultReturn(url+'/group/delete', { //DELETE GROUP
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body:JSON.stringify({user_id: user._id, group_id: group._id})
        }).then(res=>res).catch(err => err);

        console.log(deleteGroupReq);


        // let createCourseReq = await fetchDefaultReturn(url+'/course/create', {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json',
        //     },
        //     body:JSON.stringify({course_name:"CS326", professors:["Emery Berger"]})
        // }).then(res=>res).catch(err => err);

        // console.log(createCourseReq);


        findGroupReq = await fetchDefaultReturn(url+`/group/read/${group._id}`).then(res=>res).catch(err => err);

        console.log(findGroupReq);

        console.log("This last request should return an error");

    }else{
        console.log("Error: group not created successfully");
    }


}



tests();
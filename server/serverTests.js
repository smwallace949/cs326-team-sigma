

let data = {username:"smwallace", email:"sam@sam.com", name:"sam", major:"Computer Science", password:"12345"};


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

    let newUserReq = await fetchDefaultReturn('http://localhost:3000/user/create', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body:JSON.stringify(data)
    }).then(res=>res).catch(err => err);

    console.log(newUserReq);

    let userLoginReq = await fetchDefaultReturn('http://localhost:3000/user/read/login',{
        method:'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body:JSON.stringify({
            'email':"sam@sam.com",
            'password':'12345'
        })
    }).then(res=>res).catch(err => err);

    console.log(userLoginReq);

    let userIdReq = await fetchDefaultReturn('http://localhost:3000/user/read/id/0')
    .then(res=>res).catch(err => err);

    console.log(userIdReq);

    let addGroupReq = await fetchDefaultReturn('http://localhost:3000/user/update/addGroup', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body:JSON.stringify({user_id: 0, group_id:1})
    }).then(res=>res).catch(err => err);

    console.log(addGroupReq);

    let addCourseReq = await fetchDefaultReturn('http://localhost:3000/user/update/addCourse', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body:JSON.stringify({user_id: 0, course_id:2})
    }).then(res=>res).catch(err => err);

    console.log(addCourseReq);

    let createCourseReq = await fetchDefaultReturn('http://localhost:3000/course/create', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body:JSON.stringify({course_name:"CS326", professors:["Emery Berger"]})
    }).then(res=>res).catch(err => err);

    console.log(createCourseReq);

    let findCourseReq = await fetchDefaultReturn('http://localhost:3000/course/read/0').then(res=>res).catch(err => err);

    console.log(findCourseReq);

    let createGroupReq = await fetchDefaultReturn('http://localhost:3000/group/create', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body:JSON.stringify({created_by:0, name:"Java Beans", course_id:0, min_size: 2, max_size:10})
    }).then(res=>res).catch(err => err);

    console.log(createGroupReq);

    let findGroupReq = await fetchDefaultReturn('http://localhost:3000/group/read/0').then(res=>res).catch(err => err);

    console.log(findGroupReq);

    let searchGroupReq = await fetchDefaultReturn('http://localhost:3000/group/search?course_id=0').then(res=>res).catch(err => err);

    console.log(searchGroupReq);

    let addMemberReq = await fetchDefaultReturn('http://localhost:3000/group/update/addUser', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body:JSON.stringify({user_id: 1, group_id:0})
    }).then(res=>res).catch(err => err);

    console.log(addMemberReq);

    findGroupReq = await fetchDefaultReturn('http://localhost:3000/group/read/0').then(res=>res).catch(err => err);

    console.log(findGroupReq);

    let deleteGroupReq = await fetchDefaultReturn('http://localhost:3000/group/delete', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body:JSON.stringify({user_id: 0, group_id:0})
    }).then(res=>res).catch(err => err);

    console.log(deleteGroupReq);


    findGroupReq = await fetchDefaultReturn('http://localhost:3000/group/read/0').then(res=>res).catch(err => err);

    console.log(findGroupReq);

    console.log("This last request should return an error");


}



tests();
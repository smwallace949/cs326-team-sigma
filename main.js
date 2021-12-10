let sampleUsers = {
    0: {name:'Alan Castillo', email: "aacastillo@umass.edu", linkedIn: 'aacastillo', groups: [0,2,4,5], courses: [0,1,3]},
    1: {name:'Elisavet Philippakis', email: "ephilippakis@umass.edu", groups:[]},
    2: {name:'Sam Wallace', email: "swallace@umass.edu", password: "12345", groups:[]}
};

let userID = null;
let currentUser = null;

let url = "http://localhost:3000";
if (window.location.hostname !== "localhost"){
    url = "https://shielded-spire-81354.herokuapp.com";
}

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


//TODO: onload() get user obj from login, render user classes, and user groups.
window.addEventListener('load', async () => {
    if (document.getElementById('home') !== null){
        //GET user cur user Data
        let curUserObj = await fetchDefaultReturn(url+'/user/read/data').then(res=>res).catch(err => err);
        userID = curUserObj.id;
        currentUser = curUserObj.userObj;
        renderAccordion(currentUser.groups, "my-groups");
        renderClassColumn();
    }
});

if (document.getElementById('login-html') !== null) {
    //Login credentials 
    document.getElementById('login-submit').addEventListener('click', async () => {
        let email = document.getElementById('email-login').value;
        let passport = document.getElementById('password-login').value;

        let curUserObj = await fetchDefaultReturn(url+'/user/read/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body:JSON.stringify({email: email, password:passport})
        }).then(res=>res).catch(err => err);

        if (curUserObj !== undefined) {
            window.location = './home.html';
        } else {
            window.location = './';
        }
    });
} else {
    //TODO: add-class btn click --> populate class dropdown
    document.getElementById('add-class-btn').addEventListener('click', async () => {
        
        let addClassContainer = document.getElementById('add-class-container');
        let dropdown = document.getElementById('add-class-dropdown');
        if (dropdown !== null){
            addClassContainer.removeChild(dropdown);
        }

        let selectDropdown = document.createElement('select');
        selectDropdown.classList.add("form-select");
        selectDropdown.setAttribute("id", 'add-class-dropdown');
            let optHead = document.createElement('option');
            optHead.value = "class";
            optHead.innerHTML = "Classes";
            selectDropdown.appendChild(optHead);

        let courses = await fetchDefaultReturn(url+'/course/read/all').then(res=>res).catch(err => err);

        for (let classKey in courses) {
            let classObj = courses[classKey];
            let opt = document.createElement('option');
            opt.value = classKey.toString();
            opt.innerHTML = classObj.course_number;
            selectDropdown.appendChild(opt);
        }

        addClassContainer.appendChild(selectDropdown);
    });

    //TODO: add-class btn --> save changes
    document.getElementById('save-class').addEventListener('click', async () => {
        let selectedCourseID = document.getElementById('add-class-dropdown').value;
        //POST /user/addCourse/
        currentUser.courses = await fetchDefaultReturn(url+'/user/update/addGroup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body:JSON.stringify({user_id:userID, group_id:selectedCourseID})
        }).then(res=>res).catch(err => err);
        //currentUser.courses.push(selectedCourseID);
        renderClassColumn();
    });

    

    //TODO: add-group btn --> render classes dropdown in modal
    document.getElementById('addGroupButton').addEventListener('click', async () => {
        let classDropdown = document.getElementById('class-dropdown');
        console.log("current user courses");
        console.log(currentUser.courses);

        for (let classKey in currentUser.courses) {
            let class_id = currentUser.courses[classKey];
            console.log(class_id);

            let opt = document.createElement('option');
            opt.value = class_id;

            opt.innerHTML = (await fetchDefaultReturn(url+`/course/read/${class_id}`).then(res=>res).catch(err => err)).course_number;
            classDropdown.appendChild(opt);
        }
    });

    //TODO: add-group modal --> class-dropdown --> render teacher-dropdown
    document.getElementById('class-dropdown').addEventListener('click', async () => {
        let teacherDropdown = document.getElementById('teacher-dropdown');
        let classDropdown = document.getElementById('class-dropdown');
        if (classDropdown.value !== 'class') {
            teacherDropdown.disabled = false;
            //GET class/read/all
            let curCourse = await fetchDefaultReturn(url+`/course/read/${classDropdown.value}`).then(res=>res).catch(err => err);
            let teacherArr = curCourse.professors;
            //let teacherArr = classes[classDropdown.value].professors;
            for (let teacher of teacherArr) {
                let opt = document.createElement('option');
                opt.value = teacher;
                opt.innerHTML = teacher;
                teacherDropdown.appendChild(opt);
            }
        } else {
            teacherDropdown.disabled = true;
        }
    });

    //TODO: add-group modal --> save changes
    document.getElementById('saveAddedGroup').addEventListener('click', async () => {
        let modalBody = document.getElementById('add-group-modal-body');
        let teacherDropdown = document.getElementById('teacher-dropdown');
        if (teacherDropdown.disabled) {
            createDangerAlert(modalBody, "Please pick a class first before adding a group")
        } else {
            //TODO: Check whether size is an int and whether name is not empty string
            let class_id = document.getElementById('class-dropdown').value;
            let teacher = teacherDropdown.value;
            let size = document.getElementById('max-size-txt').value;
            let gname = document.getElementById('group-name').value;
            let availabilityArr = getAvailability();
            let creator = userID;

            //POST: /group/create
            currentUser.groups = await fetchDefaultReturn(url + '/group/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body:JSON.stringify(
                    {created_by: creator,
                    group_name: gname, 
                    meetings_days: availabilityArr, 
                    course_id: class_id, 
                    professor: teacher,
                    user_ids: [creator],
                    max_size: size})
            }).then(res=>res).catch(err => err);

            console.log("current user groups: ");
            console.log(currentUser.groups);

            renderAccordion(currentUser.groups, "my-groups")
            createSuccessAlert(modalBody, "Successfuly added group! Please close the tab.");
        }
    });


    
    

    

    //TODO: my-groups btn clicked --> render accordion
    document.getElementById('my-groups-btn').addEventListener('click', () => {
        let userGroups = currentUser.groups;
        let filterBar = document.getElementById('filter');
        if (filterBar !== null) {
            document.getElementById('content-column').removeChild(filterBar);
        }
        renderAccordion(userGroups, "my-groups");
    });

    //TODO: Delete Modal --> render classes and groups wih values=id
    document.getElementById('delete-btn').addEventListener('click', async() => {
        let classDropdown = document.getElementById('delete-class-dropdown');
        for (let classKey of currentUser.courses) {
            let opt = document.createElement('option');
            opt.value = classKey;
            opt.innerHTML = (await fetchDefaultReturn(url+`/course/read/${classKey}`).then(res=>res).catch(err => err)).course_name;;
            classDropdown.appendChild(opt);
        }

        let groupdropdown = document.getElementById('delete-group-dropdown');
        for (let groupID of currentUser.groups) {
            //GET group with group_id (nested fetches seems like a bad idea)
            let curGroup = await fetchDefaultReturn(url+`/group/read/${groupID}`).then(res=>res).catch(err => err);
            //let curGroup = groups[groupID];
            let opt = document.createElement('option');
            opt.value = groupID;
            opt.innerHTML = curGroup.group_name;
            groupdropdown.appendChild(opt);
        }
    });

    //TODO: Delete Modal --> if class or group selected, block out other option.
    let delClassDrop = document.getElementById('delete-class-dropdown');
    let delGroupDrop = document.getElementById('delete-group-dropdown');

    delClassDrop.addEventListener('click', () => {
        if (delClassDrop.value !== 'class') {
            delGroupDrop.setAttribute('disabled', 'true');
        } else {
            delGroupDrop.disabled = false;
        }
    });
    delGroupDrop.addEventListener('click', () => {
        if (delGroupDrop.value !== 'group') {
            delClassDrop.setAttribute('disabled', 'true');
        } else {
            delClassDrop.disabled = false;
        }
    });

    //TODO: Delete Modal --> Save Changes
    document.getElementById('delete-save').addEventListener('click', async () => {
        let modalBody = document.getElementById('delete-modal-body');
        if (!delClassDrop.disabled && !delGroupDrop) {
            createDangerAlert(modalBody, "You have not selected a group or class");
        } else if (!delClassDrop.disabled) {
            let classID = delClassDrop.value;
            let userID = userID;
            //POST: /user/removeCourse
        } else if (!delGroupDrop.disabled) {

            let groupID = delGroupDrop.value;

            let updatedGroups = await fetchDefaultReturn(url+'/group/delete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body:JSON.stringify({user_id: userID, group_id:groupID})
            }).then(res=>res).catch(err => err);
            currentUser.groups = updatedGroups;
            renderAccordion(updatedGroups, "my-groups");
            //POST /group/delete
        }
    });
}

async function renderClassColumn() {
    let classColumn = document.getElementById('my-classes');
    let classBtns = document.getElementById('class-column');
    if (classBtns !== null) {
        classColumn.removeChild(classBtns);
    }

    let courses = await fetchDefaultReturn(url+'/course/read/all').then(res=>res).catch(err => err);

    let newClassBtns = document.createElement('div');
    newClassBtns.classList.add('class-buttons');
    newClassBtns.setAttribute('id', 'class-column');

    for (let course_id_idx in currentUser.courses) {

        let course_id = currentUser.courses[course_id_idx];
        let btn = document.createElement('button');
        btn.setAttribute('type', 'button');
        btn.classList.add('btn', 'btn-outline-primary', 'btn-block', 'class-btn');
        btn.setAttribute('value', course_id);

        btn.innerHTML = (courses.filter(course => course._id === course_id))[0].course_number;

        btn.addEventListener('click', async () => {
            //GET: /course/:course_id
            let curCourse = await fetchDefaultReturn(url+`/course/read/${course_id}`).then(res=>res).catch(err => err);

            renderFilter(curCourse);
            renderAccordion(curCourse.group_ids, "add");
        }); 
        newClassBtns.appendChild(btn);
    }
    classColumn.appendChild(newClassBtns);
}

function renderFilter(curCourseObj) {
    let professorArr = curCourseObj.professors;
    let contColumn = document.getElementById('content-column');
    let oldFilter = document.getElementById("filter");

    if (oldFilter !== null) {
        contColumn.removeChild(oldFilter);
    }

    let container = document.createElement('div');
    container.classList.add('header-format', 'filter-bar');
    container.setAttribute('id', 'filter');
        let row = document.createElement('div');
        row.classList.add('row');
            let teacherCol = document.createElement('span');
            teacherCol.classList.add('col');
                let teacherDrop = document.createElement('select');
                teacherDrop.classList.add('form-select');
                teacherDrop.setAttribute('id','teacher-filter-dropdown');
                    let def = document.createElement('option');
                    def.setAttribute('value', 'teacher');
                    def.innerHTML = "Teacher";
                    teacherDrop.appendChild(def);
                    for (let teacherStr of professorArr) {
                        let def1 = document.createElement('option');
                        def1.setAttribute('value', teacherStr);
                        def1.innerHTML = teacherStr;
                        teacherDrop.appendChild(def1);
                    }
            teacherCol.appendChild(teacherDrop);

            let minSizeCol = document.createElement('span');
            minSizeCol.classList.add('col');
                let inpMin = document.createElement('div');
                inpMin.classList.add('input-group', 'mb-3');
                    let s = document.createElement('span');
                    s.classList.add('input-group-text');
                    s.innerHTML = "Min Size: ";
                    let i = document.createElement('input');
                    i.classList.add('form-control');
                    i.setAttribute('type', 'number');
                    i.setAttribute('id', 'min-size-filter');
                [s,i].forEach(x => inpMin.appendChild(x));
            minSizeCol.appendChild(inpMin);

            let maxSizeCol = document.createElement('span');
            maxSizeCol.classList.add('col');
            let inpMax = document.createElement('div');
                inpMax.classList.add('input-group', 'mb-3');
                    let s2 = document.createElement('span');
                    s2.classList.add('input-group-text');
                    s2.innerHTML = "Max Size: ";
                    let i2 = document.createElement('input');
                    i2.classList.add('form-control');
                    i2.setAttribute('type', 'number');
                    i2.setAttribute('id', 'min-size-filter');
                [s2, i2].forEach(x => inpMax.appendChild(x));
            maxSizeCol.appendChild(inpMax);

            let btnCol = document.createElement('span');
            btnCol.classList.add('col');
                let filterBtn = document.createElement('button');
                filterBtn.setAttribute('type', 'button');
                filterBtn.setAttribute('id', 'filter-btn');
                filterBtn.classList.add("btn", "btn-primary", "btn-block");
                //TODO: When filter click --> filter current groups
                filterBtn.addEventListener("click", async () => {
                    let selTeacher = teacherDrop.value;
                    let minSizeInput = i.value;
                    let maxSizeInput = i2.value;
                    let filteredGroups = [];
                    
                    for (let group_id of curCourseObj.groups) {
                        //GET group with group_id
                        let curGroup = await fetchDefaultReturn(url+`/group/read/${group_id}`).then(res=>res).catch(err => err);
                        if (selTeacher !== 'teacher' && curGroup.prof_name === selTeacher && curGroup.max_size >= parseInt(minSizeInput) && curGroup.max_size <= parseInt(maxSizeInput)) {
                            filteredGroups.push(group_id);
                        }
                    }
                    renderAccordion(filteredGroups, "add");
                });
                filterBtn.innerHTML = 'Filter';
            btnCol.appendChild(filterBtn);
        [teacherCol,minSizeCol,maxSizeCol,btnCol].forEach(x => row.appendChild(x));
    container.appendChild(row);

    contColumn.insertBefore(container, contColumn.childNodes[0]);
}

async function renderAccordion(groups_t, sector) {
    let contentColumn = document.getElementById('content-column');
    let oldAccordion = document.getElementById('my-groups-accordion');
    if (oldAccordion !== null) {
        contentColumn.removeChild(oldAccordion);
    }

    let newAccordion = document.createElement('div');
    newAccordion.classList.add("accordion");
    newAccordion.setAttribute('id', 'my-groups-accordion');

    for (let groupId of groups_t) {
        if (currentUser.groups.includes(groupId) && sector==="add") {
            continue;
        }

        //GET group with group_id
        let curGroup = await fetchDefaultReturn(url+`/group/read/${groupId}`).then(res=>res).catch(err => err);
        //let curGroup = groups[group_id];

        let idTarget = "collapse" + groupId.toString();
        let accrdItem = document.createElement('div');
        accrdItem.classList.add('accordion-item');

        let accrdBtn = document.createElement('button');
            accrdBtn.classList.add("accordion-button");
            accrdBtn.classList.add("collapsed");
            accrdBtn.setAttribute("type", "button");
            accrdBtn.setAttribute("data-bs-toggle", "collapse");
            accrdBtn.setAttribute("data-bs-target", "#"+idTarget);

            let groupNameSpan = document.createElement('span');
            groupNameSpan.classList.add("col");
            groupNameSpan.classList.add("group-attr");
            groupNameSpan.innerHTML = curGroup.group_name;
            accrdBtn.appendChild(groupNameSpan);
            
            let courseSpan = document.createElement('span');
            courseSpan.classList.add("col");
            courseSpan.classList.add("group-attr");

            let groupCourse = await fetchDefaultReturn(url +`/course/read/${curGroup.course_id}`)
            courseSpan.innerHTML = groupCourse.course_number;

            accrdBtn.appendChild(courseSpan);

            let availabilitySpan = document.createElement('span');
            availabilitySpan.classList.add("col");
            availabilitySpan.classList.add("group-attr");
            let availStr = "";

            for (let dayidx in curGroup.meeting_days) {
                let day = curGroup.meeting_days[dayidx];
                availStr += (day + " ");
            }

            availabilitySpan.innerHTML = availStr;
            accrdBtn.appendChild(availabilitySpan);

            let teacherSpan = document.createElement('span');
            teacherSpan.classList.add("col");
            teacherSpan.classList.add("group-attr");
            teacherSpan.innerHTML = curGroup.professor;
            accrdBtn.appendChild(teacherSpan);

            let sizeSpan = document.createElement('span');
            sizeSpan.classList.add("col");
            sizeSpan.classList.add("group-attr");
            sizeSpan.innerHTML = curGroup.max_size;
            accrdBtn.appendChild(sizeSpan);

        let accrdCollapseDiv = document.createElement('div');
            accrdCollapseDiv.setAttribute("id", idTarget);
            accrdCollapseDiv.classList.add("accordion-collapse");
            accrdCollapseDiv.classList.add("collapse");
            let accrdBodyDiv = document.createElement('div');
            accrdBodyDiv.classList.add("accordion-body");
                let titleDiv = document.createElement('div');
                let strongDiv = document.createElement('strong')
                strongDiv.innerHTML = "Group Members";
                titleDiv.appendChild(strongDiv);
                accrdBodyDiv.appendChild(titleDiv);

                for (let member_id_idx in curGroup.user_ids) {
                    let member_id = curGroup.user_ids[member_id_idx];

                    let tempDiv = document.createElement('div');
                    let userInfo = await fetchDefaultReturn(url+`/user/read/id/${member_id}`);

                    let divStr = userInfo.name;
                    divStr += (" -> " + userInfo.email);
                    tempDiv.innerHTML = divStr;
                    accrdBodyDiv.appendChild(tempDiv);
                }
                if (sector==="add") {
                    let joinButtonContainer = document.createElement('div');
                    joinButtonContainer.classList.add('row', 'justify-content-center');
                        let joinBtn = document.createElement('button');
                        joinBtn.setAttribute('type', 'button');
                        joinBtn.classList.add('btn', 'btn-success', 'btn-join');
                        joinBtn.innerHTML = "JOIN"
                        joinBtn.addEventListener('click', async () => {
                            currentUser.groups = await fetchDefaultReturn(url + '/user/update/addGroup', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body:JSON.stringify({
                                    user_id: userID, 
                                    group_id: groupId, 
                                })
                            }).then(res=>res).catch(err => err);
                            renderAccordion(groups_t, "add");
                        });
                    joinButtonContainer.appendChild(joinBtn);
                    accrdBodyDiv.appendChild(joinButtonContainer);
                }
            accrdCollapseDiv.appendChild(accrdBodyDiv);
        
        accrdItem.appendChild(accrdBtn);
        accrdItem.appendChild(accrdCollapseDiv);
        newAccordion.appendChild(accrdItem);
    }
    contentColumn.appendChild(newAccordion);
}

function createSuccessAlert(parent, innerText) {
    let errorAlert = document.getElementById('save-group-error');
    if (errorAlert !== null) {
        parent.removeChild(errorAlert);
    }

    let div = document.createElement('div');
    div.classList.add("row");
    div.classList.add("modal-row");
    div.classList.add("alert");
    div.classList.add("alert-success");
    div.setAttribute('role', 'alert');
    div.setAttribute('id', 'save-group-success');
    div.innerHTML = innerText;
    parent.appendChild(div);
}

function getAvailability() {
    let availability = [];
    let days = document.getElementsByClassName('availability');
    for (let i=0; i<days.length; i++) {
        if (days[i].checked) {
            let obj = {};
            obj[i] = days[i].value
            availability.push(obj);
        }
    }
    return availability;
}

function createDangerAlert(parent, innerText) {
    let successAlert = document.getElementById('save-group-success')
    if (successAlert !== null) {
        parent.removeChild(successAlert);
    }
    let div = document.createElement('div');
    div.classList.add("row");
    div.classList.add("modal-row");
    div.classList.add("alert");
    div.classList.add("alert-danger");
    div.setAttribute('role', 'alert');
    div.setAttribute('id', 'save-group-error');
    div.innerHTML = innerText;
    parent.appendChild(div);
    return div;
}

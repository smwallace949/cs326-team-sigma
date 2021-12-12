//Global Variables
let userID = null;
let currentUser = null;

//Product vs. Development URL
let url = "http://localhost:3000";
if (window.location.hostname !== "localhost"){
    url = "https://shielded-spire-81354.herokuapp.com";
}

window.addEventListener('load', async () => {
    if (document.getElementById('home') !== null){
        //GET User Data Data
        let curUserObj = await fetchDefaultReturn(url+'/user/read/data').then(res=>res).catch(err => err);
        userID = curUserObj.id;
        currentUser = curUserObj.userObj;

        renderPage();
    } else if (document.getElementById('login-html') !== null) {
        addLoginEventListener();
    }
});

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

function renderPage() {
   //Render page top down, from left to right
   renderNavigationBar();
   renderClassColumn();
   renderGroupsColumn();
}

function renderNavigationBar() {
    renderMyGroupsModal();
    renderAddGroupsModal();
    renderDeleteModal();
}

function renderMyGroupsModal() {
    //TODO: my-groups btn clicked --> render accordion
    document.getElementById('my-groups-btn').addEventListener('click', () => {
        let userGroups = currentUser.groups;
        let filterBar = document.getElementById('filter');
        if (filterBar !== null) {
            document.getElementById('content-column').removeChild(filterBar);
        }
        renderAccordion(userGroups, "my-groups");
    });
}

function renderAddGroupsModal() {
    document.getElementById('addGroupButton').addEventListener('click', async () => {
        let parentDiv = document.getElementById('addGroup_select-class');
        let classDropdown = createDropdown('class-dropdown', parentDiv, "Class");

        for (let classKey in currentUser.courses) {
            let class_id = currentUser.courses[classKey];
            let opt = document.createElement('option');
            opt.value = class_id;

            opt.innerHTML = (await fetchDefaultReturn(url+`/course/read/${class_id}`).then(res=>res).catch(err => err)).course_number;
            classDropdown.appendChild(opt);
        }

        parentDiv.appendChild(classDropdown);

        addTeacherEventListener();
        groupSaveChanges_EventListener();
    });
}

function createDropdown(container_id, parent_object, default_value){
    let dropdown = document.getElementById(container_id);
    if (dropdown !== null) {
        parent_object.removeChild(dropdown)
    }

    let newDropdown = document.createElement('select');
    newDropdown.classList.add('form-select');
    newDropdown.setAttribute('id', container_id);

    let opt = document.createElement('option');
    opt.value = default_value;
    opt.innerHTML = default_value;
    newDropdown.appendChild(opt);

    return newDropdown;
}

function addTeacherEventListener() {
    document.getElementById('class-dropdown').addEventListener('click', async () => {
        let parentDiv = document.getElementById("addGroup_select-teacher");
        let teacherDropdown = createDropdown('teacher-dropdown', parentDiv, "Teacher");

        let classDropdown = document.getElementById('class-dropdown');
        if (classDropdown.value !== 'Class') {
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
        parentDiv.appendChild(teacherDropdown);
    });
}

function groupSaveChanges_EventListener() {
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
                    {created_by: creator, group_name: gname, meeting_days: availabilityArr,
                    course_id: class_id, professor: teacher, user_ids: [creator], max_size: size})
            }).then(res=>res).catch(err => err);

            renderAccordion(currentUser.groups, "my-groups")
            createSuccessAlert(modalBody, "Successfuly added group! Please close the tab.");
        }
    });
}

function createDangerAlert(parent, innerText) {
    let successAlert = document.getElementById('save-group-success')
    if (successAlert !== null) {
        parent.removeChild(successAlert);
    }
    let div = document.createElement('div');
    div.classList.add("row", "modal-row", "alert", "alert-danger");
    div.setAttribute('role', 'alert');
    div.setAttribute('id', 'save-group-error');
    div.innerHTML = innerText;
    parent.appendChild(div);
    return div;
}

function getAvailability() {
    let availability = [];
    let days = document.getElementsByClassName('availability');

    for (let i=0; i<days.length; i++) {
        if (days[i].checked) {
            availability.push(days[i].value);
        }
    }
    return availability;
}

function createSuccessAlert(parent, innerText) {
    let errorAlert = document.getElementById('save-group-error');
    if (errorAlert !== null) {
        parent.removeChild(errorAlert);
    }

    let div = document.createElement('div');
    div.classList.add("row", "modal-row", "alert", "alert-success");
    div.setAttribute('role', 'alert');
    div.setAttribute('id', 'save-group-success');
    div.innerHTML = innerText;
    parent.appendChild(div);
}

function renderDeleteModal() {
    document.getElementById('delete-btn').addEventListener('click', async() => {
        let groupParentDiv = document.getElementById("deleteGroup_select-group");
        let groupDropdown = createDropdown('delete-group-dropdown', groupParentDiv, "Group");

        for (let groupID of currentUser.groups) {
            //GET group with group_id (nested fetches seems like a bad idea)
            let curGroup = await fetchDefaultReturn(url+`/group/read/${groupID}`).then(res=>res).catch(err => err);
            let opt = document.createElement('option');
            opt.value = groupID;
            opt.innerHTML = curGroup.group_name;
            groupDropdown.appendChild(opt);
        }

        groupParentDiv.appendChild(groupDropdown);
    });
    deleteSaveChanges_EventListener()
}

    function deleteSaveChanges_EventListener() {
        document.getElementById('delete-save').addEventListener('click', async () => {
            let delGroupDrop = document.getElementById('delete-group-dropdown');
            if (delGroupDrop.value !== "Group") {
                let updatedGroups = await fetchDefaultReturn(url+'/group/delete', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body:JSON.stringify({user_id: userID, group_id:delGroupDrop.value})
                }).then(res=>res).catch(err => err);
    
                currentUser.groups = updatedGroups;
                renderAccordion(updatedGroups, "my-groups");
            }            
        });
    }

function renderClassColumn() {
    renderAddClassModal();
    renderClasses();
}

    function renderAddClassModal() {
        document.getElementById('add-class-btn').addEventListener('click', async () => {
            let addClassContainer = document.getElementById('add-class-container');
            let selectDropdown = createDropdown('add-class-dropdown', addClassContainer, "Class")
        
            let courses = await fetchDefaultReturn(url+'/course/read/all').then(res=>res).catch(err => err);
        
            for (let classKey in courses) {
                let classObj = courses[classKey];
                let opt = document.createElement('option');
                opt.value = courses[classKey]._id.toString();
                opt.innerHTML = classObj.course_number;
                selectDropdown.appendChild(opt);
            }
        
            addClassContainer.appendChild(selectDropdown);
        });

        addClassSaveChanges_EventListener();
    }

    function addClassSaveChanges_EventListener() {
        document.getElementById('save-class').addEventListener('click', async () => {
            let selectedCourseID = document.getElementById('add-class-dropdown').value;
            //POST /user/addCourse/
            currentUser.courses = await fetchDefaultReturn(url+'/user/update/addCourse', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body:JSON.stringify({user_id:userID, course_id:selectedCourseID})
            }).then(res=>res).catch(err => err);
            //currentUser.courses.push(selectedCourseID);
            renderClasses();
        });
    }

function renderGroupsColumn() {
    renderAccordion(currentUser.groups, "my-groups");

}

function addLoginEventListener() {
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
}


async function renderClasses() {
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
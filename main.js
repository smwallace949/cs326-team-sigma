/*
let classes = {
    0: {course_name:'CS345', professors: ['Jaime Davila', 'Marco Serafini'], groups:[0,1,2]}, 
    1: {course_name:'CS326', professors: ['Emery Berger'], groups:[0,1]}, 
    2: {course_name:'CS220', professors: ['Marius Minea'], groups:[0]},
    3: {course_name:'CS383', professors: ['Mathew Rattigan'], groups:[]}
};

let groups = {
    0: {created_by: 'Alan', 
        name: 'Night Grinders1',
        meetings_days: ['Teus', 'Wed', 'Thurs'],
        course_name: 'CS326',
        prof_name: 'Emery Berger',
        max_size: 3,
        member_ids: [0,1,2]
    },
    1: {created_by: 'Alan', 
        name: 'CodeTrek1',
        meetings_days: ['Teus', 'Wed', 'Thurs'],
        course_name: 'CS326',
        prof_name: 'Emery Berger',
        max_size: 4,
        member_ids: [0,1,2]
    },
    2: {
        created_by: 'Alan', 
        name: 'JavaSip1',
        meetings_days: ['Teus', 'Wed', 'Thurs'],
        course_name: 'CS326',
        prof_name: 'Jaime Davila',
        max_size: 4,
        member_ids: [0,1,2]
    }
}*/
let users = {
    0: {name:'Alan Castillo', email: "aacastillo@umass.edu", linkedIn: 'aacastillo', groups: [0,1,2], courses: [1, 0]},
    1: {name:'Elisavet Philippakis', email: "ephilippakis@umass.edu", groups: [0], courses: [1, 3]},
    2: {name:'Sam Wallace', email: "swallace@umass.edu", groups: [0,1,2], courses: [0,1,2,3,]}
};

let userID = 0;
let currentUser = users[userID];

//const url = "http://localhost:3000";
const url  = "https://shielded-spire-81354.herokuapp.com"
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


window.addEventListener('load', () => {
    if (document.getElementById('home') !== null){
        renderAccordion(currentUser.groups);
        renderClassColumn(currentUser.courses);
    }
});
//TODO: add-class btn click --> populate class dropdown


document.getElementById('add-class-btn').addEventListener('click', async () => {
    let classDropdown = document.getElementById('add-class-dropdown');

    let courses = await fetchDefaultReturn(url+'/course/read/all').then(res=>res).catch(err => err);

    for (let classKey in courses) {
        let opt = document.createElement('option');
        opt.value = classKey.toString();
        opt.innerHTML = courses[classKey];
        classDropdown.appendChild(opt);
    }
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

    for (let course_id of currentUser.courses) {
        let btn = document.createElement('button');
        btn.setAttribute('type', 'button');
        btn.classList.add('btn', 'btn-outline-primary', 'btn-block', 'class-btn');
        btn.setAttribute('value', course_id);
        btn.innerHTML = courses[course_id];
        btn.addEventListener('click', async () => {
            //GET: /course/:course_id
            let curCourse = await fetchDefaultReturn(url+`/course/read/${course_id}`).then(res=>res).catch(err => err);
            console.log(curCourse);
            renderFilter(curCourse.professors);
            renderAccordion(curCourse.groups);
        }); 
        newClassBtns.appendChild(btn);
    }
    classColumn.appendChild(newClassBtns);
}

function renderFilter(professorArr) {
    let container = document.createElement('div');
    container.classList.add('container', 'filter-bar');
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
                    for (let teacherStr of professorArr) {
                        let def = document.createElement('option');
                        def.setAttribute('value', teacherStr);
                        def.innerHTML = teacherStr;
                    }
                teacherDrop.appendChild(def);
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
                    i.setAttribute('type', 'text');
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
                    i2.setAttribute('type', 'text');
                    i2.setAttribute('id', 'min-size-filter');
                [s2, i2].forEach(x => inpMax.appendChild(x));
            maxSizeCol.appendChild(inpMax);

            let btnCol = document.createElement('span');
            btnCol.classList.add('col');
                let filterBtn = document.createElement('button');
                filterBtn.setAttribute('type', 'button');
                filterBtn.setAttribute('id', 'filter-btn');
                filterBtn.classList.add("btn", "btn-primary", "btn-block");
                filterBtn.innerHTML = 'Filter';
            btnCol.appendChild(filterBtn);
        [teacherCol,minSizeCol,maxSizeCol,btnCol].forEach(x => row.appendChild(x));
    container.appendChild(row);

    let contColumn = document.getElementById('content-column');
    contColumn.insertBefore(container, contColumn.childNodes[0]);
}


//TODO: add-group btn --> render classes dropdown in modal
document.getElementById('addGroupButton').addEventListener('click', async () => {
    let classDropdown = document.getElementById('class-dropdown');
    for (let classKey in currentUser.courses) {
        let opt = document.createElement('option');
        opt.value = classKey;
        opt.innerHTML = (await fetchDefaultReturn(url+`/course/read/${classKey}`).then(res=>res).catch(err => err)).course_name;
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
            body:JSON.stringify({created_by: creator, 
                name: gname, 
                meetings_days: availabilityArr, 
                course_id: class_id, 
                prof_name: teacher,
                max_size: size})
        }).then(res=>res).catch(err => err);
        
        createSuccessAlert(modalBody, "Successfuly added group! Please close the tab.");
    }
});


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
    div.classList.add("row");
    div.classList.add("modal-row");
    div.classList.add("alert");
    div.classList.add("alert-success");
    div.setAttribute('role', 'alert');
    div.setAttribute('id', 'save-group-success');
    div.innerHTML = innerText;
    parent.appendChild(div);
}

//TODO: my-groups btn clicked --> render accordion
document.getElementById('my-groups-btn').addEventListener('click', () => {
    let userGroups = currentUser.groups;
    let filterBar = document.getElementById('filter');
    if (filterBar !== null) {
        document.getElementById('content-column').removeChild(filterBar);
    }
    renderAccordion(userGroups);
});

async function renderAccordion(groups_t) {
    let contentColumn = document.getElementById('content-column');
    contentColumn.removeChild(document.getElementById('my-groups-accordion'));

    let newAccordion = document.createElement('div');
    newAccordion.classList.add("accordion");
    newAccordion.setAttribute('id', 'my-groups-accordion');

    for (let group_id of groups_t) {
        //GET group with group_id
        let curGroup = await fetchDefaultReturn(url+`/group/read/${group_id}`).then(res=>res).catch(err => err);
        //let curGroup = groups[group_id];

        let idTarget = "collapse" + group_id.toString();
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
            groupNameSpan.innerHTML = curGroup.name;
            accrdBtn.appendChild(groupNameSpan);
            
            let availabilitySpan = document.createElement('span');
            availabilitySpan.classList.add("col");
            availabilitySpan.classList.add("group-attr");
            let availStr = "";
            for (let day of curGroup.meetings_days) {
                availStr += (day + " ");
            }
            availabilitySpan.innerHTML = availStr;
            accrdBtn.appendChild(availabilitySpan);

            let teacherSpan = document.createElement('span');
            teacherSpan.classList.add("col");
            teacherSpan.classList.add("group-attr");
            teacherSpan.innerHTML = curGroup.prof_name;
            accrdBtn.appendChild(teacherSpan);

            let sizeSpan = document.createElement('span');
            sizeSpan.classList.add("col");
            sizeSpan.classList.add("group-attr");
            sizeSpan.innerHTML = curGroup.max_size;
            accrdBtn.appendChild(sizeSpan);

            let idSpan = document.createElement('span');
            idSpan.classList.add("col");
            idSpan.classList.add("group-attr");
            idSpan.innerHTML = group_id;
            accrdBtn.appendChild(idSpan);

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
                for (let member_id of curGroup.member_ids) {
                    let tempDiv = document.createElement('div');
                    let userInfo = users[member_id]
                    let divStr = userInfo.name;
                    divStr += (" -> " + userInfo.email);
                    tempDiv.innerHTML = divStr;
                    accrdBodyDiv.appendChild(tempDiv);
                }
            accrdCollapseDiv.appendChild(accrdBodyDiv);
        
        accrdItem.appendChild(accrdBtn);
        accrdItem.appendChild(accrdCollapseDiv);
        newAccordion.appendChild(accrdItem);
    }
    contentColumn.appendChild(newAccordion);
}

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
        opt.innerHTML = curGroup.name;
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

        let groupID = parseInt(delGroupDrop.value);

        let updatedGroups = await fetchDefaultReturn(url+'/group/delete', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body:JSON.stringify({user_id: userID, group_id:groupID})
        }).then(res=>res).catch(err => err);
        currentUser.groups = updatedGroups;
        renderAccordion(updatedGroups);
        //POST /group/delete
    }
});
//TODO: when a class is clicked, it shoulder render groups for that class on content page

let users = {
    0: {name:'Alan Castillo', email: "aacastillo@umass.edu", linkedIn: 'aacastillo', groups: [0,1,2], courses: [1, 0]},
    1: {name:'Elisavet Philippakis', email: "ephilippakis@umass.edu", groups: [0], courses: [1, 3]},
    2: {name:'Sam Wallace', email: "swallace@umass.edu", groups: [0,1,2], courses: [0,1,2,3,]}
};

let currentUser = users[0];

let classes = {
    0: {course_name:'CS345', professors: ['Jaime Davila', 'Marco Serafini'], groups:[]}, 
    1: {course_name:'CS326', professors: ['Emery Berger'], groups:[]}, 
    2: {course_name:'CS220', professors: ['Marius Minea'], groups:[]},
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
}
//TODO: onload() get user obj from login, render user classes, and user groups.

//TODO: when add class clicked, populate drop down menu
document.getElementById('add-class-btn').addEventListener('click', () => {
    let classDropdown = document.getElementById('add-class-dropdown');

    //GET class/read/all
    for (let classKey in classes) {
        let opt = document.createElement('option');
        opt.value = classKey.toString();
        opt.innerHTML = classes[classKey].course_name;
        classDropdown.appendChild(opt);
    }
});

//TODO: save-changes-btn for add class to user
document.getElementById('save-class').addEventListener('click', () => {
    let selectedCourseID = document.getElementById('add-class-dropdown').value;
    //POST /user/addCourse/
    currentUser.courses.push(selectedCourseID);
    renderClassColumn();
});

function renderClassColumn() {
    let classColumn = document.getElementById('my-classes');
    let classBtns = document.getElementById('class-column');
    classColumn.removeChild(classBtns);

    let newClassBtns = document.createElement('div');
    newClassBtns.classList.add('class-buttons');
    newClassBtns.setAttribute('id', 'class-column');

    for (let course_id of currentUser.courses) {
        let btn = document.createElement('button');
        btn.setAttribute('type', 'button');
        btn.classList.add('btn', 'btn-outline-primary', 'btn-block');
        btn.setAttribute('value', course_id);
        btn.innerHTML = classes[course_id].course_name; 
        newClassBtns.appendChild(btn);
    }
    classColumn.appendChild(newClassBtns);
}


//TODO: When add-group-btn clicked, render drop class drop down
document.getElementById('addGroupButton').addEventListener('click', () => {
    let classKey;
    let classDropdown = document.getElementById('class-dropdown');
    for (classKey in classes) {
        //add classkey as option to class dropdown
        let opt = document.createElement('option');
        opt.value = classKey;
        opt.innerHTML = classKey;
        classDropdown.appendChild(opt);
    }
});

//TODO: Connected to btn above. When class picked, enable the pick teacher button and populate teachers from selected class
let classDropdown = document.getElementById('class-dropdown');
classDropdown.addEventListener('click', () => {
    if (classDropdown.value !== 'class') { //if a value was selected other than the default
        //enable and populate the teacher dropdown
        let teacherDropdown = document.getElementById('teacher-dropdown');
        teacherDropdown.disabled = false;
        let i;
        let teacherArr = classes[classDropdown.value];
        for (i in teacherArr) {
            let teacher = teacherArr[i];
            let opt = document.createElement('option');
            opt.value = teacher;
            opt.innerHTML = teacher;
            teacherDropdown.appendChild(opt);
        }
    }
});

//TODO: When save changes clicked, add group to user data and class groups
document.getElementById('saveAddedGroup').addEventListener('click', () => {
    let modalBody = document.getElementById('add-group-modal-body');
    let teacherDropdown = document.getElementById('teacher-dropdown');
    if (teacherDropdown.disabled) {
        //add alert to modal
        let div = document.createElement('div');

        div.classList.add("row");
        div.classList.add("modal-row");
        div.classList.add("alert");
        div.classList.add("alert-danger");

        div.setAttribute('role', 'alert');
        div.setAttribute('id', 'save-group-error');
        div.innerHTML = "Please pick a class first before adding a group";
        modalBody.appendChild(div);
    } else {
        //TODO: Check whether size is an int and whether name is not empty string
        let classname = document.getElementById('class-dropdown').value;
        let teacher = teacherDropdown.value;
        let size = document.getElementById('max-size-txt').value;
        let name = document.getElementById('group-name').value;
        //get availability
        let availability = [];
        let days = document.getElementsByClassName('availability');
        for (let i=0; i<days.length; i++) {
            if (days[i].checked) {
                availability.append(days[i].value);
            }
        }
        //TODO: POST changes to backend
        
        //remove error message if it exists print saved successfully
        if (document.getElementById('save-group-error') !== null) {
            modalBody.removeChild(document.getElementById('save-group-error'));
        }
        let div = document.createElement('div');

        div.classList.add("row");
        div.classList.add("modal-row");
        div.classList.add("alert");
        div.classList.add("alert-success");

        div.setAttribute('role', 'alert');
        div.innerHTML = "Successfuly added group! Please close the tab.";
        modalBody.appendChild(div);
    }
});

//TODO: When my groups clicked, it should render user group data on content page
document.getElementById('my-groups-btn').addEventListener('click', () => {
    let userGroups = currentUser.groups;
    renderAccordion(userGroups);
});

function renderAccordion(groups_t) {
    let contentColumn = document.getElementById('content-column');
    contentColumn.removeChild(document.getElementById('my-groups-accordion'));
    
    let newAccordion = document.createElement('div');
    newAccordion.classList.add("accordion");
    newAccordion.setAttribute('id', 'my-groups-accordion');

    for (let group_id of groups_t) {
        //GET group with group_id
        let curGroup = groups[group_id];

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
//TODO: when a class is clicked, it shoulder render groups for that class on content page
//TODO: Delete page
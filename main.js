const url = "https://shielded-spire-81354.herokuapp.com";

let users = {
    0: {name:'Alan Castillo', email: "aacastillo@umass.edu", linkedIn: 'aacastillo', groups: [0,1,2], courses: ['CS326', 'CS345']},
    1: {name:'Elisavet Philippakis', email: "ephilippakis@umass.edu"},
    2: {name:'Sam Wallace', email: "swallace@umass.edu"}
};

let classes = {'CS345': ['Jaime Davila', 'Marco Serafini'], 
    'CS326': ['Emery Berger'], 
    'CS220': ['Marius Minea'], 
    'CS383': ['Mathew Rattigan']
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

//TODO: When create group clicked, render drop class drop down
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

//TODO: when add class clicked, populate drop down menu
document.getElementById('add-class-btn').addEventListener('click', () => {
    let classKey;
    let classDropdown = document.getElementById('add-class-dropdown');
    for (classKey in classes) {
        //add classkey as option to class dropdown
        let opt = document.createElement('option');
        opt.value = classKey;
        opt.innerHTML = classKey;
        classDropdown.appendChild(opt);
    }
});

//TODO: When class picked, enable the pick teacher button and populate teachers from selected class
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
        //TODO: store into objs
        let userGroups = {}; //{groupID: {name: '', size: 0, availability: [], members=[], }}
        let classGroups = {}; //{class: {groups: [], name: '', size: 0, availability: []}}
        
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

//TODO: When my groups clicked, it should render user data groups on content page
document.getElementById('my-groups-btn').addEventListener('click', () => {
    let contentColumn = document.getElementById('content-column');
    contentColumn.removeChild(document.getElementById('my-groups-accordion'));
    
    let newAccordion = document.createElement('div');
    newAccordion.classList.add("accordion");
    newAccordion.setAttribute('id', 'my-groups-accordion');

    //GET user_ID, GET user group_ids, 
    let userID = 0;
    let userInfo = users[userID];
    let userGroups = userInfo['groups'];
    
    for (let group_id of userGroups) {
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
});
/*
let user = {
    0: {name:'Alan', email: "aacastillo@umass.edu", linkedIn: 'aacastillo', groups: [0,1,2], courses: ['CS326', 'CS345']},
    1: {name:'Elisavet Philippakis', email: "ephilippakis@umass.edu"},
    2: {name:'Sam Wallace', email: "swallace@umass.edu"}
};

let classes = {'CS345': ['Jaime Davila', 'Marco Serafini'], 
    'CS326': ['Emery Berger'], 
    'CS220': ['Marius Minea'], 
    'CS383': ['Mathew Rattigan']
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
//TODO: when a class is clicked, it shoulder render groups for that class on content page
//TODO: Delete page
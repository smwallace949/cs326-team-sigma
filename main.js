let userData = {} //name, contact information, availability,
let userGroups = {}; //{class: {groups: [], name: '', size: 0, availability: []}}
let classGroups = {}; //{class: {groups: [], name: '', size: 0, availability: []}}
let classes = {'CS345': ['Jaime Davila', 'Marco Serafini'], 'CS326': ['Emery Berger'], 'CS220': ['Marius Minea'], 'CS383':['Mathew Rattigan']};

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
//TODO: when a class is clicked, it shoulder render groups for that class on content page
//TODO: Delete page
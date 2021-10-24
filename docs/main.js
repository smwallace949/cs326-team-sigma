import {userData, classGroups, classes} from './data-structures';
// {class: groups[{name: grinders, daysOfWeek: ['mon', 'teus'], professor: Emery, size: 4}]}

//TODO: When create group clicked, render drop class drop down
document.getElementById('addGroupButton').addEventListener('click', () => {
    let classKey;
    let select = document.getElementById('class-dropdown');
    for (classKey in classes) {
        //add classkey as option to class dropdown
        let opt = document.createElement('option');
        opt.value = classKey;
        opt.innerHTML = classKey;
        select.appendChild(opt);
    }
});

//TODO: When class picked, enable the pick teacher button and populate teachers from selected class
let classDropdown = document.getElementById('class-dropdown');
classDropdown.addEventListener('click', () => {
    if (classDropdown.value !== 'class') { //if a value was selected other than the default
        //enable and populate the teacher dropdown
        
    }
})
//TODO: When save changes clicked, add group to user data and class groups
//TODO: When my groups clicked, it should render user data groups on content page
//TODO: when a class is clicked, it shoulder render groups for that class on content page
//TODO: Delete page
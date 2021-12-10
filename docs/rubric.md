# Final Grading Rubric #
---

## Login Page ##

#### TO TEST, USE CREDENTIALS {"smwallace@umass.edu", "password"} FOR ACCOUNT WITH EXISTING DATA

- Given valid ceredntials, loads the home page.
- Given invalid credentials, reloads the page.

### ___/100 ###

---

## Create Account Page ##

- Given a valid umass email and password, save user information.
- Redirects to login page after created account, with input credentials as now valid.

### ___/100 ###

---

## Home Page ##

* Displays groups you are currently a member of, with:
    * class
    * meeting days
    * instructor 
    * group size 
    * group member data (when clicked)
* Displays all member classes on the side bar
    * When clicked on, leads to "Search for Groups" page for that class.

### ___/100 ###

---

## Search for Groups Page ##

* Displays Groups for selected class which the user is not already a member of.
* When clicked on, displays group members and join button.
* When join button clicked, group is added to list of groups on home page.

### ___/100 ###

---

## Top Bar/Modals ##

* Has four buttons on the top:
    * "My Groups": Leads to Home Page
    * "Add Group": Opens "Create Group" modal. 
    * "Delete": Opens 'Delete Class/Group" modal.
    * "Log Out": Logs the current user out and redirects to the home screen.
* "Create Group" Modal
    * Contains Fields for Class, Instructor, Meeting Days, Group Size, and Group Name
    * When valid group info submitted, new group is seen on home page of the user that created it.
* "Delete Class/Group" Modal
    * Contains dropdowns for classes and groups the user is a part of to possibly delete.
    * If group or class is deleted, it is removed from the home page when "Save Changes" is pressed.

### ___/100 ###

---


## Backend/CRUD ##

* Create
    * Create User
    * Create Group
    * Create Class
* Read
    * Read User by login
    * Read User by ID
    * Read Group by ID
    * Read Group by properties
    * Read Class by ID
    * Read all Classes
* Update
    * Update User by ID
    * Update Group by ID
    * Update Class by ID
* Delete
    * Delete Group by ID, Current User ID (User ID must be the one that created group)
    * Delete Class by ID

### ___/100 ###

---

## Miscellaneous ##

* Video showing the functionality above.
* HTML is validated.
* JS is linted.
* setup.md complete, in docs folder.


### ___/100 ###

---


# Total #

## ___/100 ##



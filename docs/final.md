Heroku Deployment URL:
https://shielded-spire-81354.herokuapp.com


### Title ###
Team Sigma
### Subtitle ### 
Studdy Buddy
### Semester ### 
Fall 2021
### Overview: A brief overview of your application. This will be based on what you are submitting as your final web application artifact. You should also mention why your application is innovative. ### 
The main goal of the application is to ease the process of connecting with your classmates in search of study groups and partners for any mutual college course. A user creates account, selects which classes they are taking, and is immediately given a list of existing study groups within that class. They can also create and delete their own groups, specifying details like meeting times, specific professor of the group's course, and maximum size. Something like this would be possible with a more broadly-applicable social media platform, but having an interface built speciically for this task helps overcoming the all-too-common inertia and imposter syndrome following the thought reaching out to peers with help on content you don't understand. 
### Team Members: A list of your team members, with names and GitHub aliases. ### 
Alan Castillo
Elisavet Philippakis
Sam Wallace
### User Interface: A final up-to-date list/table describing your application’s user interface. This should include the name of the UI view and its purpose. You should include a screenshot of each of your UI views. ### 

### APIs, URL Routes/Mappings ### 

Page Endpoints:

* GET: /
    * Gets login page, entrance to application.
* GET: /test
    * Goes to page which tests server endpoints

User Endpoints:

* Create
    * POST: /user/create
        * req body: all fields above, other than user_id, groups, and classes
        * used at create account screen
        * response body: status code only
* Read
    * GET: /user/read/login
        * used at login screen
        * request body: email and password of user logging in
        * response body: entire user object with userId
    * GET: /user/read/id/:user_id
        * used for retrieving non-current user info
        * returns user obj
    * GET: /user/read/data
        * returns current session user's information.
* Update
    * POST: /user/update/addGroup/
        * req body: user_id and group_id, adding group_id to groups member of user identified by user_id
        * used when current user joins or creates a group
    * POST: /user/update/addCourse/
        * req body: user_id and course_id, adding course_id to groups member of user identified by user_id
        * used when current user adds a course they are in
* Delete
    * None

Course Endpoints

* Create
    * POST: /course/create/
        * req body: professors within class not called by user, but used to populate backend with class data info needed by users to make and search for groups
* Read
    * GET: /course/read/:course_id
        * used for getting groups the current user is already a part of
        * returns all fields of the course with id :course_id
    * GET:/course/read/all
        * used to get all the course id's and their name
* Update
    * None
* Delete
    * None

Group Endpoints
* Create
    * POST: /group/create
        * req body: all fields above, except group_id and member_ids (with the only element being the user_id of the user who created the group)
        * Adds group to user and class
        * used when a group is created by a user
        * response body: status code only
* Read
    * GET: /group/read/:group_id
        * used for getting groups the current user is already a part of
        * returns all fields of the group with id :group_id
* Update
    * POST /group/update/addUser
        * req body: user_id and group_id of group to add user user_id to.
        * returns status code only
* Delete 
    * POST /group/delete
        * req body: group_id, user_id. user_id must match created_by field of group group_id, and if so, group group_id is deleted. 

### Database: A final up-to-date representation of your database including a brief description of each of the entities in your data model and their relationships if any. ### 

### URL Routes/Mappings: A final up-to-date table of all the URL routes that your application supports and a short description of what those routes are used for. You should also indicate any authentication and permissions on those routes. ### 

### Authentication/Authorization: A final up-to-date description of how users are authenticated and any permissions for specific users (if any) that you used in your application. You should mention how they relate to which UI views are accessible. ### 

### Division of Labor: A breakdown of the division of labor for each team member — that is, saying who did what, for the entire project. Remember that everyone is expected to contribute roughly equally to each phase of the project. We expect to see similar numbers and kinds of GitHub commits by each student. ### 

### Conclusion: A conclusion describing your team’s experience in working on this project. This should include what you learned through the design and implementation process, the difficulties you encountered, what your team would have liked to know before starting the project that would have helped you later, and any other technical hurdles that your team encountered. ### 
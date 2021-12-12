Heroku Deployment URL:
https://shielded-spire-81354.herokuapp.com


### Title ###
Team Sigma
### Subtitle ### 
Grouply
### Semester ### 
Fall 2021
### Overview: A brief overview of your application. This will be based on what you are submitting as your final web application artifact. You should also mention why your application is innovative. ### 
The main goal of the application is to ease the process of connecting with your classmates in search of study groups and partners for any mutual college course. A user creates account, selects which classes they are taking, and is immediately given a list of existing study groups within that class. They can also create and delete their own groups, specifying details like meeting times, specific professor of the group's course, and maximum size. Something like this would be possible with a more broadly-applicable social media platform, but having an interface built speciically for this task helps overcoming the all-too-common inertia and imposter syndrome following the thought reaching out to peers with help on content you don't understand. 
### Team Members: A list of your team members, with names and GitHub aliases. ### 

- Alan Castillo (aacastillo)
- Elisavet Philippakis (ephilippakis)
- Sam Wallace (samwallace949)

### User Interface: A final up-to-date list/table describing your application’s user interface. This should include the name of the UI view and its purpose. You should include a screenshot of each of your UI views. ### 

__Login__

![screenshot](pictures\login1html.png)
This is the first page the user is presented with. The password value is hidden as they type to kee the password secure. They also can create and an account, but this UI is mainly for user authentication.

![screenshot](pictures\createUser.png)
This UI is for new users to create accounts and get added to the database.

__User Groups__

![screenshot](pictures\My_Groups.png)
When the user first logs in he is presented with all the groups that he is currently in. The purpose of this is so that the user can see which groups he is currently in and so he can also view the group availability and further click on each group to get the group member's contact information.

__Add Group__

![screenshot](pictures\Add_Group.png)
This UI feature is so that users can create groups for classes, which other users can see and join. They provide context for the group, like what class it is for, what instructor is teaching it, what is the preferred meeting times, and the preferred group size.

__Delete Group__

![screenshot](pictures\deletehtml.png)
This feature allows users to delete groups that they currently are in. The purpose of this is to provide a way for users to leave groups that they are currently in.

__Classes__

![screenshot](.\pictures\addclasshtml.png)
Users can search for groups in different classes by clicking on the class buttons on the left column. These classes represent the classes that they are currently enrolled in. They can join groups from here and also filter through groups based on prefences through this page.

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

Classes document
{

    _id: <ObjectId1>,
    course_name: String,  // Name of the course
    couse_number: String,  // Course number with department ex. CS326
    professors: Array, // Array of Strings that are professors teaching the class
    group_ids: Array // Array of ObjectId’s of groups for a given class -> related to Groups _id
    
}

Groups document
{
    
    _id: <ObjectId1>,
    created_by: <ObjectId1>, // ID of person who created the group
    group_name: String, // A given groups name
    meeting_days: Array, // Array of strings containing the days the group can meet
    course_id: <ObjectId1>, // ObjectId of the course the group is studying for -> related to Classes _id
    professor_name: String // Name of the professor teaching the section of the course you are in
    max_size: Integer, // Maximum size of the group
    user_ids: Array // Array of ObjectIds of the people in the group -> related to Users _id
    
}

Users document
{
    
    _id: <ObjectId1>,
    name: String,  // Full name of the user
    username: String, // Username
    email: String, // UMass email
    phone: Integer, // Phone number (optional)
    linkedin: String, // LinkedIn URL (optional)
    snapchat: String, // Snapchat handle (optional)
    major: String, // Major of the user
    bio: String, // Just a bit of information about a person
    groups: Array, // Array of ObjectIds of the groups a user is in -> related to Groups _id
    courses: Array // Array of ObjectIds of the courses a user is in -> related to Classes _id
    
}

### Authentication/Authorization: A final up-to-date description of how users are authenticated and any permissions for specific users (if any) that you used in your application. You should mention how they relate to which UI views are accessible. ###

We save the information of the current user on the server when the login button is pressed and valid credentials have peen input to the login fields. This server variable provides session information for the home page and all other account-specific pages. This saved variable is erased when the user logs out.

### Division of Labor: A breakdown of the division of labor for each team member — that is, saying who did what, for the entire project. Remember that everyone is expected to contribute roughly equally to each phase of the project. We expect to see similar numbers and kinds of GitHub commits by each student. ### 

All members: Wrote documentation and made demonstration video. 

Alan Castillo: Worked on javascript bugs, HTML bugs.

Sam Wallace: Fixed server-side JS bugs and MongoDB query bugs.

Elisavet Philippakis: Validated HTML and javascript, fixed HTML bugs.

### Conclusion: A conclusion describing your team’s experience in working on this project. This should include what you learned through the design and implementation process, the difficulties you encountered, what your team would have liked to know before starting the project that would have helped you later, and any other technical hurdles that your team encountered. ### 

I would say that the general source of this project's challenges came not from overly complex algrithms required for our application, but simpler code, a lot of it, worked on by many people. When you must rely on someone else's mental model of a certain function or group of functions, it is easy to make small mistakes like variable name typos (and not easy-to-find ones; particularly as members in an HTTP response object which silently evaluated to undefined), writing extraneous blocks of code, and messing up someone else's coding format. If we were to do this project again, we would like to have known how crucial it is to make only well-thought-out and well-documented changes to the code. Additionally, I believe we all would agree that MongoDB was the single most difficult technology to work with, and that we should have used a SQL solution. The most frustrating aspect of working with MongoDB was finding the relevant version of the documentation. The fact that this was so difficult made debugging a much longer process as we had to spend a lot of time searching for the current version of the right MongoDB driver.
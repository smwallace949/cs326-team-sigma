Database Configuration:

Classes document
{
	_id: <ObjectId1>,
	course_name: String,  // Name of the course
	couse_number: String,  // Course number with department ex. CS326
    professors: Array, // Array of String that are professors teaching the class
    group_ids: Array // Array of ObjectId's of groups for a given class
}

Groups document
{
	_id: <ObjectId1>, 
	created_by: <ObjectId1>, // ID of person who created the group
	group_name: String, // A given groups name
    meeting_days: Array, // Array of strings containing the days the group can meet
    course_id: <ObjectId1>, // ObjectId of the course the group is studying for
    professor_name: String // Name of the professor teaching the section of the course you are in
    max_size: Integer, // Maximum size of the group
    user_ids: Array // Array of ObjectIds of the people in the group
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
    groups: Array, // Array of ObjectIds of the groups a user is in
    courses: Array // Array of ObjectIds of the courses a user is in
}

Heroku Deployment URL:
https://shielded-spire-81354.herokuapp.com

Breakdown of labor:
Alan: Integrated HTML rendering in javascript for MongoDB CRUD operations, debugging.
Elisavet: Set up MongoDB Cluster with above collections, created secret file, example document of collections, group endpoints for CRUD operations with MongoDB
Sam: Updated endpoints with logic for CRUD operations on the database, more backend logic. Wrote tests for endpoints (servertests.js)
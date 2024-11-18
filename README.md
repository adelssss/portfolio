# portfolio
# Description 
This project involves creating a portfolio platform where users can register, log in, and manage their portfolio items. Admin users have full control, allowing them to create, edit, and delete items, while Editor users are only allowed to create new items. The portfolio will feature a carousel displaying three images per item, along with a title, description, and timestamps for creation, update, and deletion. The platform will also integrate external APIs to provide additional data visualizations and will utilize Nodemailer for notifications.
# Features
User Authentication: Register, login, and manage sessions.
Registarion form: connect to mongoDB,then after successfull registration send you to login
Login: log in system
News: give you info about chosen city
# Technologies Used
Node.js: Backend runtime environment.
Express.js: Web framework for Node.js.
MongoDB: NoSQL database for storing user and portfolio data.
Mongoose: MongoDB ORM for object data modeling.
Bcryptjs: For hashing and comparing passwords.
Nodemailer: For sending email notifications.
# Requirements
Backend (Node.js/Express) -Install Node.js, MongoDB, and Express.js. -Create MongoDB schema in the measurements collection, supporting:  username, 
password, first name, last name, age, gender.
# Frontend
-Create user-friendly interface using ejs and css.
# Installation
Steps to Set Up: 1.Initialize project. 2.Install npm packages: npm init -y npm i mongoose npm i body-parser. 3.Create folder structure. .Configure MongoDB connection:MONGODB_URL=<your_mongo_uri>. 5. add information into your MongoDB database using registration form  6.Start the server :npm start. portfolio will be available  at:http://localhost:3000.
# Endpoints
Endpoints
User Routes
POST /register: Register a new user (Admins and Editors).
POST /login: Login an existing user.
GET /logout: Logout the current user.
Portfolio Routes
POST /portfolio: Create a new portfolio item (Admin/Editor).
PUT /portfolio/
: Update a portfolio item (Admin only).
DELETE /portfolio/
: Delete a portfolio item (Admin only).
Notes
Admin Role: Can create, edit, and delete portfolio items.
Editor Role: Can only create portfolio items.


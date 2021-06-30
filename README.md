# Overview
---
**Game Session Maker** lets you host, join and discuss video games and gaming sessions. Join a community of gamers who enjoy social gaming.

# Features
---
## Search for games via GiantBomb's comprehensive database, and also via the server's database.

![alt Search for games in 2 ways](/README_images/1.JPG)

- **Search**: Search GiantBomb's database. 
- **All Games**: Search the server's database. All game data here are obtained from GiantBomb. When a user adds a schedule from GiantBomb's database, the game is automatically added to the server.

## Track and Manage all your account details, schedules, requests, and posts on your profile page.

![alt Manage your schedules](/README_images/4.JPG)

- **Edit your Profile**: Change your avator image, first name, last name, email and password. User ID and Username cannot be changed.
- **Drag and Drop Images**: Drag and drop your avator image onto the outlined box.

![alt Manage your schedules](/README_images/2.JPG)

- **Archive Schedules**: This will make the schedule "inactive" or "private", and make it not appear in searches.
- **Delete Schedules**: This will permanently delete the schedule from the server's database.
- **View Schedules**: You can go to the schedules' pages directly from your "My Schedules" page.

![alt Manage your requests](/README_images/3.JPG)

- **Delete Sent Requests**: This will permanently delete and cancel the request that you sent.
- **Approve or Decline Received Requests**: You can make decisions here, or on the schedule's page.

## Create schedules multiple ways via the simple User Interface. You must be signed in to create a schedule.

![alt Create a Schedule](/README_images/5.JPG)

- **Create Schedule**: From here, you can choose a game from the server's database.

-![alt Create a Schedule from All Games](/README_images/6.JPG)

- **Create Schedule from Game**: Pick a game from the "All Games" page and the "Create a Schedule" form will automatically select the game of your choice.

![alt Create a Schedule from GiantBomb Search](/README_images/7.JPG)

![alt Create a Schedule from GiantBomb Search](/README_images/8.JPG)

- **Create Schedule from GiantBomb's API Search**: Pick a game from the "Search" feature. When you click on "Create A Schedule", the site will take you to the "Create a Schedule" page with the game description taken directly from GiantBomb's database.  

## Search for schedules.

![alt Search All Schedules](/README_images/9.JPG)

- **Filter by Multiple Criterias**: You can filter your search by multiple criterias. The site will remember your search criteria if you click on a schedule from the page and click on the back button from the subsequent schedule page.

![alt Search Schedules from All Games](/README_images/10.JPG)

- **Search for a schedule from the "All Games" page**: This will automatically search our database for all schedules pertaining to the game your picked.

![alt Star Symbol](/README_images/11.JPG)

![alt Envelope Symbol](/README_images/12.JPG)

![alt Check Symbol](/README_images/13.JPG)

- **Schedule Icon Indicators**: These symbols will state your status for the specific schedule. 
    - **Star Symbol**: This indicates that you are the host or the creator of the schedule.
    - **Envelope Symbol**: This indicates that you have already sent a join request to the host of the schedule.
    - **Check Symbol**: This indicates that you have been approved for the schedule.

## Join schedules by sending requests and waiting for the host's response.

![alt Request to Join](/README_images/14.JPG)

![alt Request to Join](/README_images/15.JPG)

- **You must be signed in**: You must be signed in to request to join a schedule. After getting approved, you will be able to participate in the discussions by posting and viewing messages. 

## Things you can do on the schedule page.
### **As User**

![alt Post Messages](/README_images/16.JPG)

- **Post Messages**: You can post messages to the message board. If you are the host, your posts will be highlighted in light yellow color.

![alt View All Approved Users](/README_images/17.JPG)

- **See All Approved Users**: You can view all approved users for the schedule.

### **As Host**

![alt View and Manage Requests and Users](/README_images/18.JPG)

- **View and Manage Requests**: Manage your received requests from this particular schedule here.
- **View and Manage Approved Users**: You can kick users out of the schedule.

# Tech Stack
---
**Front-end**: Javascript, (AJAX, JSON), CSS, HTML, Bootstrap

**Back-end**: Python, Flask, Jinja, SQLAlchemy, PostgreSQL

**Libraries/APIs**: GiantBomb API, Pybomb

# Data Model
---

![alt Database Model](/README_images/projectmodel.jpg)

# Setup/Installation
---
## Requirement(s)
- GiantBomb API key: https://www.giantbomb.com/api/

## Installation Instructions
1. Clone this repository
2. Create and activate a virtual environment
3. Install dependencies from requirements.txt
4. Seed the database by running seed_database.py
5. Run server.py to start up the server
5. View the app on your browser at localhost:5000
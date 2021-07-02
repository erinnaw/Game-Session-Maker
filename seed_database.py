"""Script to seed database."""
import os
import json
from random import choice, randint, sample
from datetime import datetime
import time

import crud
from model import db, User, Game, Schedule, Request, Post, Schedule_Users, connect_to_db, Platform
import server

os.system('dropdb scheduler')
os.system('createdb scheduler')

connect_to_db(server.app)
db.create_all()


MAX_USERS = 10
MAX_SCHEDULES_PER_USER = 5
MAX_REQUESTS_PER_USER = 10
MAX_POSTS_PER_USER = 1

first_names = ["Abby", "Becca", "Cathy", "Darren", "Eric", "Fran", "Garry", "Harry", "Ingrid", "Jackie", "Karen", "Larry", 
                "Mary", "Noir", "Oprah", "Perry", "%*Q!", "Rick", "Sarah", "Ted", "Umbria", "Valerie", "Wayne", "Xander", "Yara", "Zara"]
last_names = ["Ashe", "Benjamin", "Cassidy", "D%^AX~", "Emery", "Ferry", "Gambit", "Hans", "Ingot", "Jesse", "Kennedy", "Lee", 
                "Mara", "Nate", "Omah", "Ping", "Qi", "Ren", "Sanders", "Tickles", "Uber", "Vicky", "White", "X-K-D#$", "Young", "Zen"]
platform = ["PC", "Playstation", "Xbox", "Nintendo"]
#game_list = ["Dota 2", "Overwatch", "Counter-Strike", "Monster Hunter", "World of Warcraft", "Starcraft", "Rocket League", "Among Us", "Battlefield", 
#            "Battlefield 2", "Battlefield 3", "League of Legends", ""]


crud.create_user("admin", "admin", "admin", "admin&#64;email.com", "admin", "/static/img/avator15.jpg")

#generate users
for i in range(MAX_USERS):
    fname = first_names[randint(0, len(first_names)-1)]
    lname = last_names[randint(0, len(last_names))-1]
    crud.create_user("user"+str(i), fname, lname, "user"+str(i)+"&#64;email.com", fname, "/static/img/avator"+str(randint(1,16))+".jpg")

#generate games
game_list = []
gamelist_file = open("game-list.txt")
for line in gamelist_file:
    word = line.rstrip()
    game_list.append(word)

start = 0
counter = 0
for i in range(0, len(game_list)-1):
    if counter == 4:
        time.sleep(1)
        counter = 0

    else:
        server.seed_games(game_list[i])
        counter+=1

MAX_GAMES = len(game_list)
#create schedules
#add_schedule(user_id, game_id, datetime, timezone, platform, description, max_user, max_team=1)
#"%Y-%m-%d %H:%M"
for i in range(1, MAX_USERS+1):
    for j in range(1, MAX_SCHEDULES_PER_USER+1):
        game_id = str(randint(1, 48))
        platforms = crud.get_game_platforms_by_id(game_id)
        if platforms:
            crud.add_schedule(str(i), game_id, datetime(2021, randint(7,12), randint(1, 28), randint(1,23), randint(1,59)),
                                "(GMT -4:00) Atlantic Time (Canada), Caracas, La Paz", platforms[randint(0, len(platforms)-1)].platform_id, "Generated via seed_database.", str(randint(1,100)), str(randint(0,10)))
        else:
            platform_ = crud.get_platform_by_name('N/A')
            crud.add_schedule(str(i), game_id, datetime(2021, randint(7,12), randint(1, 28), randint(1,23), randint(1,59)),
                           "(GMT -4:00) Atlantic Time (Canada), Caracas, La Paz", platform_.platform_id, "Generated via seed_database.", str(randint(1,100)), str(randint(0,10)))

#create requests
#add_request(user_id, schedule_id, msg)
count_schedules = crud.count_schedules()
for i in range(1, MAX_USERS+1):
    nums = sample(range(1, count_schedules), MAX_REQUESTS_PER_USER)
    for num in nums:
        if i != num:
            crud.add_request(str(i), num, "My request to join is generated by seed_database.")

#approve or decline requests
#accept request = add_user_to_schedule(schedule_id, user_id)
#delete request
for i in range(1, crud.count_requests()+1):
    request = crud.get_request_by_id(i)
    crud.add_user_to_schedule(request.schedule_id, request.user_id)
    crud.remove_request(i)


#post on schedules as host
#for every user
#for every schedule per user
#add_post(user_id, schedule_id, content)
for i in range(1, MAX_USERS+1):
    schedules = crud.get_schedules_by_user_id(i)
    for schedule in schedules:
        crud.add_post(i, schedule.schedule_id, "Post generated by seed_database.")


#post on schedules as user
for i in range(1, crud.count_schedules()+1):
    users = crud.get_users_by_schedule_id(i)
    for user in users:
        for j in range(1, MAX_POSTS_PER_USER+1):
            crud.add_post(user.user_id, i, "Post generated by seed_database.")

for i in range(1, crud.count_schedules()+1):
    users = crud.get_users_by_schedule_id(i)
    for user in users:
        for j in range(1, MAX_POSTS_PER_USER+1):
            crud.add_post(user.user_id, i, "Post generated by seed_database.")



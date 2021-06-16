"""Script to seed database."""
import os
import json
from random import choice, randint
from datetime import datetime

import crud
from model import db, User, Game, Schedule, Request, Post, Schedule_Users, connect_to_db
import server

os.system('dropdb scheduler')
os.system('createdb scheduler')

connect_to_db(server.app)
db.create_all()

crud.create_user("admin", "admin", "admin", "admin@email.com", "admin", "/static/img/avator-placeholder.jpg")
crud.create_user("user", "user", "user", "user@email.com", "user", "/static/img/avator-placeholder.jpg")
crud.create_user("user1", "user1", "user1", "user1@email.com", "user1", "/static/img/avator-placeholder.jpg")
crud.create_user("user2", "user2", "user2", "user2@email.com", "user2", "/static/img/avator-placeholder.jpg")

crud.add_game('Dota 2', '/static/img/image-placeholder.jpg')
crud.add_game('Overwatch', '/static/img/image-placeholder.jpg')
crud.add_game('Counter-Strike', '/static/img/image-placeholder.jpg')
crud.add_game('Monster Hunter', '/static/img/image-placeholder.jpg')
crud.add_game('World of Warcraft', '/static/img/image-placeholder.jpg')
crud.add_game('Starcraft', '/static/img/image-placeholder.jpg')
crud.add_game('Rocket League', '/static/img/image-placeholder.jpg')
crud.add_game('Among Us', '/static/img/image-placeholder.jpg')

for i in range(10):
    crud.add_schedule(1, 1, datetime.now(), "(GMT -4:00) Atlantic Time (Canada), Caracas, La Paz", "pc", "generating via seed_database", 4, 1)

for i in range(10):
    crud.add_schedule(2, 4, datetime.now(), "(GMT -4:00) Atlantic Time (Canada), Caracas, La Paz", "pc", "generating via seed_database", 4, 1)

for i in range(10):
    crud.add_schedule(3, 5, datetime.now(), "(GMT -4:00) Atlantic Time (Canada), Caracas, La Paz", "pc", "generating via seed_database", 4, 1)

for i in range(10):
    crud.add_schedule(4, 6, datetime.now(), "(GMT -4:00) Atlantic Time (Canada), Caracas, La Paz", "pc", "generating via seed_database", 4, 1)
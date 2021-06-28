from flask import Flask, render_template, request, flash, session, redirect, jsonify
from model import connect_to_db
from jinja2 import StrictUndefined
import crud
from datetime import datetime
import requests
import json
import os
import hashlib
import pybomb
import sys
os.system("sh keys.sh")

app = Flask(__name__)
app.secret_key = "secret"
app.jinja_env.undefined = StrictUndefined

# IGDB API call initialization
#igdb = {
#    "client_id": os.environ['CLIENT_ID_IGDB'],
#    "client_secret": os.environ['CLIENT_SECRET_IGDB'],
#    "grant_type": "client_credentials"
#}

#igdb_token = "https://id.twitch.tv/oauth2/token?"
#igdb_baseURL = "https://api.igdb.com/v4/"

#for key, value in igdb.items():
#    if key == "client_id":
#        igdb_token += f"{key}={value}"
#    else:
#        igdb_token += f"&{key}={value}"

#API_response = requests.post(igdb_token)
#API_response_json = API_response.json()

#igdb_header = {
#    "content-type": "application/json",
#    "Client-ID": "761m6x4eageu6w69f5tnxamjtufjgv",
#    "Authorization": "Bearer "+API_response_json["access_token"]
#}

# IGDB API fields
# age_ratings,aggregated_rating,aggregated_rating_count,alternative_names,artworks,bundles,category,
# checksum,collection,cover,created_at,dlcs,expanded_games,expansions,external_games,first_release_date,
# follows,forks,franchise,franchises,game_engines,game_modes,genres,hypes,involved_companies,keywords,
# multiplayer_modes,name,parent_game,platforms,player_perspectives,ports,rating,rating_count,release_dates,
# remakes,remasters,screenshots,similar_games,slug,standalone_expansions,status,storyline,summary,tags,themes,
# total_rating,total_rating_count,updated_at,url,version_parent,version_title,videos,websites

#fields = "fields name, game_modes.name, artworks.url, platforms.name, first_release_date;"
#limit = " limit 20;"
#where = " where game_modes != 1;"
#search = ""

# Giantbomb API call initialization
API_KEY_GB = os.environ['API_KEY_GIANTBOMB']
GB_client = pybomb.GamesClient(API_KEY_GB)

GAMES_URL_GB = "http://www.giantbomb.com/api/games/"
return_fields = ('deck', 'original_release_date', 'image', 'name', 'platforms', 'site_detail_url', 'id')
sort_by = 'name'


@app.route("/")
def homepage():
    """View homepage."""

    return render_template("homepage.html")


@app.route("/game-info.json", methods=["GET"])
def get_game_info():
    """Get game info from an API call."""

    data = request.args.get("search")

    # IGDB API call
    #search = " search \""+data+"\";"
    #results = requests.post("https://api.igdb.com/v4/games", headers=igdb_header, data=fields+limit+where+search)
    #results_json = results.json()

    #game modes
    #fields1 = "fields checksum,created_at,name,slug,updated_at,url;"
    #gamemodes = requests.post("https://api.igdb.com/v4/game_modes", headers=igdb_header, data=fields1)
    #print(gamemodes.json())

    #artwork
    #fields2 = "fields alpha_channel,animated,checksum,game,height,image_id,url,width;"
    #artwork = requests.post("https://api.igdb.com/v4/game_modes", headers=igdb_header, data=fields2)
    #print(artwork.json())
    # ----------------------------------------------------------------------------------------------------------->>
    # Giantbomb call code
    # Documentation: https://www.giantbomb.com/api/documentation/#toc-0-17
    # Pybomb: https://pybomb.readthedocs.io/_/downloads/en/stable/pdf/
    
    
    page_offset = request.args.get('page_offset')
    limit = request.args.get('limit')
    offset = int(limit) * int(page_offset)
    filter_by = {'name': data}

    response = GB_client.search(
        filter_by=filter_by,
        return_fields=return_fields,
        sort_by=sort_by,
        desc=True,
        limit=limit,
        offset=offset
    )

    #print("------------------IGDB API call----------------->")
    #for result in response.results:
    #    print(result)

    return json.dumps(response)


@app.route("/seed-games")
def seed_games(game_name):
    """Seed games into db."""

    #fields2 = "fields name, artworks.url;"
    #search = " search \""+game_name+"\";"
    #fields = "fields alpha_channel,animated,checksum,game,height,image_id,url,width;"
    #games = requests.post("https://api.igdb.com/v4/games", headers=igdb_header, data=fields2+search)
    #games_json = games.json()
    #games_ = json.dumps(games_json)

    #print("------------------IGDB API call----------------->")
    #print(games_)

    #for game in games_json:
    #    if game.get("artworks", 0):
    #        artwork_url = game["artworks"][0]["url"]
    #        crud.set_game_image_by_name(game_name, artwork_url)

    filter_by = {'name': game_name}
    return_fields = ('name', 'image', 'platforms')
    response = GB_client.search(
        filter_by=filter_by,
        return_fields=return_fields,
        limit=1,
    )

    if len(response.results):
        if response.results[0]['name']:
            game = crud.add_game(response.results[0]['name'])

            if response.results[0]['image']['super_url']:
                crud.set_game_image_by_name(game_name, response.results[0]['image']['super_url'])
            
            if response.results[0]['image']['icon_url']:
                crud.set_game_icon_by_name(game_name, response.results[0]['image']['icon_url'])

            if response.results[0]['platforms']:
                for platform in response.results[0]['platforms']:
                    crud.add_platform(game.game_id, platform['name'])
            else:
                crud.add_platform(game.game_id, 'N/A')

    return json.dumps(response)


@app.route("/get-game-info-GB", methods=["GET"])
def get_game_details_GB():
    """Return details for a game from the GB database."""

    results = dict()
    platforms = list()
    game_id = request.args.get("game_id")

    filter_by = {'id': game_id}
    return_fields = ('name', 'deck', 'image', 'platforms', 'site_detail_url')
    response = GB_client.search(
        filter_by=filter_by,
        return_fields=return_fields,
        limit=1,
    )

    if len(response.results):
        if response.results[0]['image']['icon_url']:
            results['icon_url'] = response.results[0]['image']['icon_url']
        
        else :
            results['icon_url'] = 'game-url-not-found.jpg'

        if response.results[0]['image']['super_url']:
            results['super_url'] = response.results[0]['image']['super_url']
        
        else :
            results['super_url'] = 'game-url-not-found.jpg'

        if response.results[0]['deck']:
            results['deck'] = response.results[0]['deck']
        else:
            results['deck'] = 'N/A'

        if response.results[0]['platforms']:
            for platform in response.results[0]['platforms']:
                platforms.append(platform['name'])
        else:
            platforms.append('N/A')
        
        results['platforms'] = platforms

        if response.results[0]['site_detail_url']:
            results['site_detail_url'] = response.results[0]['site_detail_url']
        else:
            results['site_detail_url'] = 'N/A'

    return jsonify(results)
    

@app.route("/get-platforms/<game_id>")
def get_platforms_by_game(game_id):
    """Return the platforms for a game."""

    platforms = crud.get_game_platforms_by_id(game_id)
    p_ = list()

    for platform in platforms:
        p_.append({"name": platform.name, "platform_id": platform.platform_id})

    return jsonify(p_)


@app.route("/add-user", methods=["POST"])
def add_user():
    """Create a new user."""

    username = request.form.get("username")
    fname = request.form.get("fname")
    lname = request.form.get("lname")
    email = request.form.get("email")
    password = request.form.get("password")
    image_path = request.form.get("image_path")
    flash = ''
    status = 0

    if crud.get_user_by_username(username):
        flash = "Username already exist."
        status = 1

    elif crud.get_user_by_email(email):
        flash = "User\"s email already exist."
        status = 2

    elif username == "" or email == "" or password == "":
        flash = "Username, email and password is required."
        status = 3

    else:
        if len(password) < 6 or len(password) > 20:
            flash = "Password must be between 6 to 20 characters."
            status = 4           

        else:
            crud.create_user(username, fname, lname, email, password, image_path)
            flash = "User created. Please log in."
            status = 0

    return jsonify({"flash": flash, "status": status})


@app.route("/get-hashkey", methods=["POST"])
def get_hashkey():
    """Send user a hash key."""

    email = request.form.get("email")
    user = crud.get_user_by_email(email)
    h = hashlib.md5(user.password.encode('utf-8'))

    return jsonify(h.hexdigest())


@app.route("/login", methods=["POST"])
def log_in():
    """Find user and log in user to session."""

    email = request.form.get("email")
    user_password = request.form.get("password")
    user = crud.get_user_by_email(email)
    user_email = ""

    if email == "" or user_password == "":
        flash = "All field input is required."
        status = "0"

    elif user:
        password = user.password
        
        if password == user_password:
            session["user"] = user.user_id
            flash = f"Logged in as {user.username}"
            user_email = user.email
            status = "1"    
        else:
            flash = "Password is incorrect."
            status = "0"
    else:
        flash = "Email has not been registered."
        status = "0"

    data = {"flash": flash, "status": status, "email": user_email}

    return jsonify(data)


@app.route("/logout", methods=["POST"])
def log_out():
    """View log in page."""
    
    if session.get("user", 0):
        session.pop("user")
        flash = "You have been logged out."
        status = "1"
    else:
        flash = "You are already logged out."
        status = "0"

    data = {"flash": flash, "status": status}

    return jsonify(data)


@app.route("/profile", methods=["GET"])
def get_user():
    """Get logged user profile page."""

    if session.get("user",0):
        user = crud.get_user_by_id(session["user"])
        data = {"user_id": user.user_id,
                "username": user.username, 
                "firstname": user.first_name, 
                "lastname": user.last_name,
                "image_path": user.image_path,
                "email": user.email,
                "password": user.password}

        return jsonify(data)
    
    return "None"


@app.route("/edit-profile", methods=["POST"])
def edit_profile():
    """Edit logged user"s profile."""

    flash = ""
    fname = request.form.get("fname")
    lname = request.form.get("lname")
    email = request.form.get("email")
    password = request.form.get("password")
    image_path = request.form.get("image_path")

    if session.get("user", 0):
        if crud.set_user_profile(session["user"], fname, lname, email, password, image_path):
            flash = "Profile Updated"

        else:
            flash = "Error: Profile could not be changed." 

    else:
        flash = "You must be logged in to edit your profile"

    return flash


@app.route("/user-schedules", methods=["GET"])
def get_user_schedules():
    """Get logged user schedules."""
    
    data_list = list()

    if session.get("user",0):
        schedules = crud.get_schedules_by_user_id(session["user"])

        for schedule in schedules:
            game = crud.get_game_by_id(schedule.game_id)
            host = crud.get_user_by_id(schedule.user_id)
            platform = crud.get_platform_by_id(schedule.platform_id)

            data = {"type": "host",
                    "host_username": host.username,
                    "schedule_id": schedule.schedule_id,
                    "game_id": schedule.game_id,
                    "game_name": game.name,
                    "datetime": schedule.datetime, 
                    "timezone": schedule.timezone, 
                    "platform": platform.name,
                    "max_user": schedule.max_user,
                    "max_team": schedule.max_team,
                    "description": schedule.description,
                    "isArchived": schedule.isArchived}
            data_list.append(data)

        schedules_user = crud.get_schedule_users_by_user_id(session["user"])
        for schedule_user in schedules_user:
            schedule = crud.get_schedule_by_id(schedule_user.schedule_id)
            game = crud.get_game_by_id(schedule.game_id)
            host = crud.get_user_by_id(schedule.user_id)
            platform = crud.get_platform_by_id(schedule.platform_id)

            data = {"type": "user",
                    "host_username": host.username,
                    "schedule_id": schedule.schedule_id,
                    "game_id": schedule.game_id,
                    "game_name": game.name,
                    "datetime": schedule.datetime, 
                    "timezone": schedule.timezone, 
                    "platform": platform.name,
                    "max_user": schedule.max_user,
                    "max_team": schedule.max_team,
                    "description": schedule.description,
                    "isArchived": schedule.isArchived}
            data_list.append(data)            

    return jsonify(data_list)


@app.route("/user-schedules-created", methods=["GET"])
def get_user_schedules_created():
    """Get logged user"s created schedules."""

    offset_page = request.args.get("offset_page")
    limit_size =  request.args.get("limit_size")
    offset_num = int(offset_page) * int(limit_size)
    data_list = list()

    if session.get("user",0):
        query_count = crud.get_schedules_by_user_id_count(session["user"])
        schedules = crud.get_schedules_by_user_id(session["user"], limit_size, offset_num)

        for schedule in schedules:
            game = crud.get_game_by_id(schedule.game_id)
            host = crud.get_user_by_id(schedule.user_id)
            platform = crud.get_platform_by_id(schedule.platform_id)
            data = {"type": "host",
                    "host_username": host.username,
                    "schedule_id": schedule.schedule_id,
                    "game_id": schedule.game_id,
                    "game_name": game.name,
                    "datetime": schedule.datetime, 
                    "timezone": schedule.timezone, 
                    "platform": platform.name,
                    "max_user": schedule.max_user,
                    "max_team": schedule.max_team,
                    "image_path": game.image_path,
                    "description": schedule.description}
            data_list.append(data)

    return jsonify([data_list, {"query_count": query_count}])


@app.route("/get-schedules", methods=["GET"])
def get_schedules():
    """Get all schedules."""

    username = request.args.get("username")
    game_name = request.args.get("game_name")
    date = request.args.get("date")
    time = request.args.get("time")
    offset_page = request.args.get("offset_page")
    limit_size =  request.args.get("limit_size")
    offset_num = int(offset_page) * int(limit_size)
    data = list()

    formData = {"username": username,
                "game_name": game_name,
                "date": date,
                "time": time}
    schedules = crud.get_schedules_by_criteria(formData, limit_size, offset_num)
    query_count = crud.get_schedules_count(formData)

    for schedule in schedules:
        user = crud.get_user_by_id(schedule.user_id)
        game = crud.get_game_by_id(schedule.game_id)
        platform = crud.get_platform_by_id(schedule.platform_id)
        
        data.append({"schedule_id": schedule.schedule_id,
                    "user_id": schedule.user_id,
                    "username": user.username,
                    "game_id": schedule.game_id,
                    "game_name": game.name,
                    "datetime": schedule.datetime,
                    "timezone": schedule.timezone,
                    "platform": platform.name,
                    "description": schedule.description,
                    "max_user": schedule.max_user,
                    "max_team": schedule.max_team,
                    "isArchived": schedule.isArchived})

    return jsonify([data, {"query_count": query_count}])


@app.route("/get-schedules-active", methods=["GET"])
def get_schedules_active():
    """Get all non archived schedules."""

    username = request.args.get("username")
    game_name = request.args.get("game_name")
    date = request.args.get("date")
    time = request.args.get("time") 
    offset_page = request.args.get("offset_page")
    limit_size =  request.args.get("limit_size")
    offset_num = int(offset_page) * int(limit_size)
    data = list()

    formData = {"username": username,
                "game_name": game_name,
                "date": date,
                "time": time}
    schedules = crud.get_schedules_by_criteria(formData, limit_size, offset_num)
    query_count = crud.get_schedules_count(formData)

    for schedule in schedules:
        host = crud.get_user_by_id(schedule.user_id)
        game = crud.get_game_by_id(schedule.game_id)
        platform = crud.get_platform_by_id(schedule.platform_id)
        status = 'none'

        if session.get('user', 0):
            requests = crud.get_requests_by_schedule_id(schedule.schedule_id)

            if session['user'] == host.user_id:
                status = 'host'

            elif requests:
                for request_ in requests:
                    if request_.user_id == session['user']:
                        status = 'requested'
        
            else:
                users = crud.get_schedule_users_by_schedule_id(schedule.schedule_id)

                for user in users:
                    if user.user_id == session['user']:
                        status = 'user'
                        break

        data.append({"schedule_id": schedule.schedule_id,
                    "user_id": schedule.user_id,
                    "username": host.username,
                    "game_id": schedule.game_id,
                    "game_name": game.name,
                    "datetime": schedule.datetime,
                    "timezone": schedule.timezone,
                    "platform": platform.name,
                    "description": schedule.description,
                    "max_user": schedule.max_user,
                    "max_team": schedule.max_team,
                    "isArchived": schedule.isArchived,
                    "image_path": game.image_path,
                    "status": status})

    return jsonify([data, {"query_count": query_count}])


@app.route("/user-schedules-joined", methods=["GET"])
def get_user_schedules_joined():
    """Get logged user"s joined schedules."""

    offset_page = request.args.get("offset_page")
    limit_size =  request.args.get("limit_size")
    offset_num = int(offset_page) * int(limit_size)
    data_list = list()

    if session.get("user",0):
        schedules_user = crud.get_schedule_users_by_user_id(session["user"], limit_size, offset_num)
        query_count = crud.get_schedule_users_by_user_id_count(session["user"])

        for schedule_user in schedules_user:
            schedule = crud.get_schedule_by_id(schedule_user.schedule_id)
            game = crud.get_game_by_id(schedule.game_id)
            host = crud.get_user_by_id(schedule.user_id)
            platform = crud.get_platform_by_id(schedule.platform_id)

            data = {"type": "user",
                    "host_username": host.username,
                    "schedule_id": schedule.schedule_id,
                    "game_id": schedule.game_id,
                    "game_name": game.name,
                    "datetime": schedule.datetime, 
                    "timezone": schedule.timezone, 
                    "platform": platform.name,
                    "max_user": schedule.max_user,
                    "max_team": schedule.max_team,
                    "description": schedule.description,
                    "image_path": game.image_path,
                    "isArchived": schedule.isArchived}
            data_list.append(data)            

    return jsonify([data_list, {"query_count": query_count}])


@app.route("/user-schedules-archived", methods=["GET"])
def get_user_schedules_archived():
    """Get logged user"s archived schedules."""


    offset_page = request.args.get("offset_page")
    limit_size =  request.args.get("limit_size")
    offset_num = int(offset_page) * int(limit_size)
    data_list = list()

    if session.get("user", 0):
        schedules = crud.get_archived_schedules_by_user_id(session["user"], limit_size, offset_num)
        query_count = crud.get_archived_schedules_by_user_id_count(session["user"])

        for schedule in schedules:
            game = crud.get_game_by_id(schedule.game_id)
            host = crud.get_user_by_id(schedule.user_id)
            platform = crud.get_platform_by_id(schedule.platform_id)

            data = {"type": "host",
                    "host_username": host.username,
                    "schedule_id": schedule.schedule_id,
                    "game_id": schedule.game_id,
                    "game_name": game.name,
                    "datetime": schedule.datetime, 
                    "timezone": schedule.timezone, 
                    "platform": platform.name,
                    "max_user": schedule.max_user,
                    "max_team": schedule.max_team,
                    "description": schedule.description,
                    "image_path": game.image_path,
                    "isArchived": schedule.isArchived}
            data_list.append(data)

    return jsonify([data_list, {"query_count": query_count}])


@app.route("/archive-schedule/<schedule_id>", methods=["POST"])
def set_schedule_archived(schedule_id):
    """Archive a schedule by schedule_id."""

    flash = "fail"
    schedule = crud.get_schedule_by_id(schedule_id)

    if session.get("user", 0):
        if session["user"] == schedule.user_id:
            if crud.set_schedule_archived_by_id(schedule_id):
                flash = "success"
            else:
                flash = "Error: Schedule archive failed."
        else:
            flash = "You must be the host to archive the schedule."
    else:
        flash = "You must be signed in to archive a schedule."

    return flash


@app.route("/get-schedule-by-id/<schedule_id>", methods=["GET"])
def get_schedule_by_id(schedule_id):
    """Get a schedule by schedule_id."""

    schedule = crud.get_schedule_by_id(schedule_id)
    user_ = crud.get_user_by_id(schedule.user_id)
    game = crud.get_game_by_id(schedule.game_id)
    platform = crud.get_platform_by_id(schedule.platform_id)
    status = 'none'

    if session.get('user', 0):
        if session['user'] == schedule.user_id:
            status = 'host'
        
        else:
            users = crud.get_schedule_users_by_schedule_id(schedule_id)
            
            for user in users:
                if session['user'] == user.user_id:
                    status = 'user'
                    break

    data = {"schedule_id": schedule.schedule_id,
            "user_id": schedule.user_id,
            "username": user_.username,
            "game_id": schedule.game_id,
            "game_name": game.name,
            "datetime": schedule.datetime,
            "timezone": schedule.timezone,
            "platform": platform.name,
            "description": schedule.description,
            "max_user": schedule.max_user,
            "max_team": schedule.max_team,
            "image_path": game.image_path,
            "host_avator": user_.image_path,
            "isArchived": schedule.isArchived,
            "status": status}

    return jsonify(data)


@app.route("/user-requests", methods=["GET"])
def get_user_requests():
    """Get logged user sent and received requests."""
    
    data_list = list()

    if session.get("user", 0):
        requests = crud.get_requests_by_user_id(session["user"])
        
        for request in requests:
            game = crud.get_game_by_id(request.game_id)
            schedule = crud.get_schedule_by_id(request.schedule_id)
            user = crud.get_user_by_id(request.user_id)

            data = {"type": "sent",
                    "username": user.username,
                    "request_id": request.request_id,
                    "game_id": schedule.game_id,
                    "game_name": game.name,
                    "schedule_id": schedule.schedule_id, 
                    "schedule_datetime": schedule.datetime,
                    "schedule_timezone": schedule.timezone,
                    "time_stamp": request.time_stamp,
                    "content": request.content}

            data_list.append(data)

        schedules = crud.get_schedules_by_user_id(session["user"])
        for schedule in schedules:
            for request in schedule.requests:
                game = crud.get_game_by_id(schedule.game_id)
                schedule = crud.get_schedule_by_id(request.schedule_id)
                host = crud.get_user_by_id(request.user_id)


                data = {"type": "received",
                        "host_username": host.username,
                        "request_id": request.request_id,
                        "game_id": schedule.game_id,
                        "game_name": game.name,
                        "schedule_id": schedule.schedule_id, 
                        "schedule_datetime": schedule.datetime,
                        "schedule_timezone": schedule.timezone,
                        "time_stamp": request.time_stamp,                    
                        "content": request.content}

                data_list.append(data)

    return jsonify(data_list)


@app.route("/user-sent-requests", methods=["GET"])
def get_user_sent_requests():
    """Get logged user sent requests."""

    data_list = list()

    if session.get("user", 0):
        requests = crud.get_requests_by_user_id(session["user"])
        
        for request in requests:
            game = crud.get_game_by_id(request.game_id)
            schedule = crud.get_schedule_by_id(request.schedule_id)
            host = crud.get_user_by_id(schedule.user_id)

            data = {"type": "sent",
                    "username": host.username,
                    "request_id": request.request_id,
                    "game_id": schedule.game_id,
                    "game_name": game.name,
                    "schedule_id": schedule.schedule_id, 
                    "schedule_datetime": schedule.datetime,
                    "schedule_timezone": schedule.timezone,
                    "time_stamp": request.time_stamp,
                    "content": request.content,
                    "postmark_image": '/static/img/sent.png'}

            data_list.append(data)

    return jsonify(data_list)


@app.route("/user-received-requests", methods=["GET"])
def get_user_received_requests():
    """Get logged user received requests."""

    data_list = list()

    if session.get("user", 0):
        schedules = crud.get_schedules_by_user_id(session["user"])

        for schedule in schedules:
            for request in schedule.requests:
                game = crud.get_game_by_id(schedule.game_id)
                schedule = crud.get_schedule_by_id(request.schedule_id)
                user = crud.get_user_by_id(request.user_id)

                data = {"type": "received",
                        "username": user.username,
                        "request_id": request.request_id,
                        "game_id": schedule.game_id,
                        "game_name": game.name,
                        "schedule_id": schedule.schedule_id, 
                        "schedule_datetime": schedule.datetime,
                        "schedule_timezone": schedule.timezone,
                        "time_stamp": request.time_stamp,                    
                        "content": request.content,
                        "postmark_image": '/static/img/received.png'}

                data_list.append(data)

    return jsonify(data_list)


@app.route("/user-posts", methods=["GET"])
def get_user_posts():
    """Get logged user posts."""
    
    offset_page = request.args.get("offset_page")
    limit_size =  request.args.get("limit_size")
    offset_num = int(offset_page) * int(limit_size)
    data_list = list()
    posts = crud.get_posts_by_user_id(session["user"], limit_size, offset_num)
    query_count = crud.get_posts_by_user_id_count(session["user"])

    for post in posts:
        data = {"post_id": post.post_id,
                "schedule_id": post.schedule_id,
                "time_stamp": post.time_stamp,
                "content": post.content}

        data_list.append(data)

    return jsonify([data_list, {"query_count": query_count}])


@app.route("/create-schedule", methods=["POST"])
def create_schedule():
    """Create a schedule."""

    status = "fail"
    game_id = request.form.get("game")
    date = request.form.get("date")
    time = request.form.get("time")
    timezone = request.form.get("timezone")
    platform_id = request.form.get("platform")
    description = request.form.get("description")
    max_user = request.form.get("max_user")
    max_team = request.form.get("max_team")
    schedule_id = 0
    if max_team == "":
        max_team = 0

    if session.get("user", 0):
        if description != "" and max_user != "" and date != "" and time != "":
            date_ = date.split("-")
            datetime_date = datetime(int(date_[0]), int(date_[1]), int(date_[2]))
            time_ = datetime.strptime(time,"%H:%M").time()
            date_time = datetime.combine(datetime_date, time_)
            schedule = crud.add_schedule(session["user"], 
                                        game_id, 
                                        date_time, 
                                        timezone, 
                                        platform_id, 
                                        description, 
                                        max_user, 
                                        max_team)
            schedule_id = schedule.schedule_id
            flash = "Schedule has been submitted."
            status = "success"
        else:
            flash = "All (*) field input is required."
    else:
        flash = "You need to be logged in to create a schedule."
        
    return jsonify({"flash": flash, "status": status, "schedule_id": schedule_id})


@app.route("/create-schedule-from-gamedb/<game_id>", methods=["POST"])
def create_schedule_from_gamedb(game_id):
    """Create a schedule from a particular game."""

    if crud.hasGame(game_id):
        game = crud.get_game_by_id(game_id)

        p_ = list()
        for platform in game.platforms:
            p_.append({"name": platform.name, "platform_id": platform.platform_id})

        data = {
            "game_id": game.game_id,
            "game_name": game.name,
            "platforms": p_
        }
        
        return data

    return "None"


@app.route("/create-schedule-by-search-game", methods=["POST"])
def create_schedule_by_search_game():
    """Create a schedule by using the game search API."""

    status = "fail"
    game_name = request.form.get("game")
    image_path = request.form.get("image_path")
    icon_path = request.form.get("icon_path")
    date = request.form.get("date")
    time = request.form.get("time")
    timezone = request.form.get("timezone")
    platform_name = request.form.get("platform")
    description = request.form.get("description")
    max_user = request.form.get("max_user")
    max_team = request.form.get("max_team")
    platforms_query = request.form.get("platforms")
    platforms = platforms_query.split('+') 

    schedule_id = 0
    if max_team == "":
        max_team = 0
    
    if session.get("user", 0):
        if description != "" and max_user != "" and date != "" and time != "":
            date_ = date.split("-")
            datetime_date = datetime(int(date_[0]), int(date_[1]), int(date_[2]))
            time_ = datetime.strptime(time,"%H:%M").time()
            date_time = datetime.combine(datetime_date, time_)
            game = crud.add_game(game_name, image_path, icon_path)

            for p in platforms:
                crud.add_platform(game.game_id, p)
            
            platform = crud.get_platform_by_name(platform_name)
            game_id = game.game_id
            schedule = crud.add_schedule(session["user"], 
                                        game_id, 
                                        date_time, 
                                        timezone, 
                                        platform.platform_id, 
                                        description, 
                                        max_user, 
                                        max_team)

            schedule_id = schedule.schedule_id
            flash = "Schedule has been submitted."
            status = "success"
        else:
            flash = "All (*) field input is required."
    else:
        flash = "You need to be logged in to create a schedule."
        
    return jsonify({"flash": flash, "status": status, "schedule_id": schedule_id})


@app.route("/get-all-games", methods=["GET"])
def get_all_games():
    """Get all games."""

    data = list()
    p_ = list()
    games = crud.get_games()

    for game in games:
        for platform in game.platforms:
            p_.append({"name": platform.name, "platform_id": platform.platform_id})

        data.append({"name": game.name, 
                    "game_id": game.game_id, 
                    "icon_path": game.icon_path,
                    "platforms": p_})

    return jsonify(data)


@app.route("/get-games", methods=["GET"])
def get_games():
    """Get all games by criteria."""

    game_name = request.args.get("game-name")
    sort_by = request.args.get("sort-by")
    offset_page = request.args.get("offset_page")
    limit_size =  request.args.get("limit_size")
    offset_num = int(offset_page) * int(limit_size)    
    data = list()
    
    formData = {"game_name": game_name,
                "sort_by": sort_by}
    games = crud.get_games_by_criteria(formData, limit_size, offset_num)
    query_count = crud.get_games_by_criteria_count(formData)

    p_ = list()
    for game in games:
        platforms_ = crud.get_game_platforms_by_id(game.game_id)
        for platform in platforms_:
            p_.append({"name": platform.name, "platform_id": platform.platform_id})

        data.append({"name": game.name, 
                    "game_id": game.game_id, 
                    "icon_path": game.icon_path,
                    "platforms": p_})

    return jsonify([data, {"query_count": query_count}])


@app.route("/get-game", methods=["GET"])
def get_game_by_name():
    """Get a game by name."""

    game_name = request.args.get("name")

    data = list()
    p_ = list()
    if crud.get_game_by_name(game_name):
        game = crud.get_game_by_name(game_name)
        platforms_ = crud.get_game_platforms_by_id(game.game_id)
 
        for platform in platforms_:
            p_.append({"name": platform.name, "platform_id": platform.platform_id})

        data.append({"name": game.name, 
                    "game_id": game.game_id, 
                    "platforms": p_})

    return jsonify(data)


@app.route("/get-game/<game_id>", methods=["GET"])
def get_game(game_id):
    """Get a game by id."""

    data = list()
    p_ = list()
    if crud.hasGame(game_id):
        game = crud.get_game_by_id(game_id)
        platforms_ = crud.get_game_platforms_by_id(game_id)
 
        for platform in platforms_:
            p_.append({"name": platform.name, "platform_id": platform.platform_id})

        data.append({"name": game.name, 
                    "game_id": game.game_id, 
                    "platforms": p_})

    return jsonify(data)


@app.route("/get-timezones", methods=["GET"])
def get_timezones():
    """Get all timezones in a <select> tag."""

    parseString = ""
    file = open("timezones.txt")
    for line in file:
        string = line.rstrip()
        parseString += string

    return parseString
   

@app.route("/get-posts/<schedule_id>", methods=["GET"])
def get_posts_by_schedule_id(schedule_id):
    """Get posts in schedule_id."""
    
    offset_page = request.args.get("offset_page")
    limit_size =  request.args.get("limit_size")
    offset_num = int(offset_page) * int(limit_size)
    data = list()
    posts = crud.get_posts_by_schedule_id(schedule_id, limit_size, offset_num)
    post_count = crud.get_posts_by_schedule_id_count(schedule_id)
    
    for post in posts:
        user = crud.get_user_by_id(post.user_id)
        data.append({"post_id": post.post_id, 
                    "schedule_id": post.schedule_id, 
                    "user_id": post.user_id,
                    "username": user.username,
                    "image_path": user.image_path,
                    "time_stamp": post.time_stamp,
                    "content": post.content})

    return jsonify([data, {"post_count": post_count}])


@app.route("/add-post", methods=["POST"])
def add_post():
    """Add a post."""

    flash = ""
    user_id = request.form.get("user_id")
    schedule_id = request.form.get("schedule_id")
    content = request.form.get("content")

    if session.get("user", 0):
        if(session["user"] == user_id):
            flash = "You must be logged in."
        else:
            crud.add_post(user_id, schedule_id, content)
            flash = "Message has been posted."

    return flash


@app.route("/get-schedule-user-status/<schedule_id>", methods=["GET"])
def get_schedule_user_status(schedule_id):
    """Get user status for a schedule."""

    status = ""
    schedule = crud.get_schedule_by_id(schedule_id)    

    if session.get("user", 0):
        if(session["user"] == schedule.user_id):
            status = "host"
        elif crud.hasRequested(schedule_id, session["user"]):
            status = "requested"
        else:
            schedule_users = crud.get_schedule_users_by_schedule_id(schedule_id)
            status = "not approved"
            
            for user in schedule_users:
                if(user.user_id == session["user"]):
                    status = "approved"
                    break
    else:
        status = "error: you must be signed in."

    return status


@app.route("/request/<schedule_id>", methods=["POST"])
def add_request(schedule_id):
    """Add a request to the schedule_id."""

    flash = ""
    user_id = request.form.get("user_id")
    schedule_id = request.form.get("schedule_id")
    content = request.form.get("content")
    schedule = crud.get_schedule_by_id(schedule_id)

    if session.get("user", 0):
        if session["user"] == schedule.user_id:
            flash = "You cannot send a request as a host."
        elif crud.hasRequested(schedule_id, session["user"]):
            flash = "You have already submitted a request for this schedule."
        elif crud.isScheduleUser(schedule_id, session["user"]):
            flash ="You are already an approved user for this schedule."      
        else:
            crud.add_request(session["user"], schedule_id, content)
            flash = "Request submitted."

    else:
        flash = "You must be logged in to submit a request."

    return flash


@app.route("/get-requests/<schedule_id>", methods=["GET"])
def get_requests_by_schedule_id(schedule_id):
    """Get all requests for schedule_id."""

    if session.get("user", 0):

        data = list()
        schedule = crud.get_schedule_by_id(schedule_id)
        if session["user"] == schedule.user_id:
            requests = crud.get_requests_by_schedule_id(schedule_id)
            for request in requests:
                user = crud.get_user_by_id(request.user_id)
                data.append({
                    "request_id": request.request_id,
                    "user_id": user.user_id,
                    "username": user.username,
                    "image_path": user.image_path,
                    "schedule_id": request.schedule_id,
                    "time_stamp": request.time_stamp,
                    "content": request.content
                })
    else:
        flash = "Error: You must be the host to view requests."
        return flash

    return jsonify(data)


@app.route("/approve-request/<request_id>", methods=["POST"])
def approve_request(request_id):
    """Approve a request."""  

    if session.get("user", 0):
        request = crud.get_request_by_id(request_id)
        schedule = crud.get_schedule_by_id(request.schedule_id)  
        if session["user"] == schedule.user_id:
            crud.add_user_to_schedule(schedule.schedule_id, request.user_id)
            crud.remove_request(request_id)
            flash = "User added to this schedule."
        else:
            flash = "You are not authorized to approve the request."
    else:
        flash = "You must be logged in to approve the request."

    return flash


@app.route("/decline-request/<request_id>", methods=["POST"])
def decline_request(request_id):
    """Disapprove a request."""
    
    if session.get("user", 0):
        request = crud.get_request_by_id(request_id)
        schedule = crud.get_schedule_by_id(request.schedule_id)
        if session["user"] == schedule.user_id:
            crud.remove_request(request_id)
            flash = "User has been declined."
        else:
            flash = "You are not authorized to approve the request."
    else:
        flash = "You must be logged in to decline the request."

    return flash


@app.route("/delete-request/<request_id>", methods=["POST"])
def delete_request(request_id):
    """Delete a request."""

    flash = ""

    if session.get("user", 0):
        request = crud.get_request_by_id(request_id)
        if session["user"] == request.user_id:
            crud.remove_request(request_id)
            flash = "Request deleted."

        else:
            flash = "You must be the requestee to delete the request."

    else:
        flash = "You must be signed in to delete your request."

    return flash 


@app.route("/get-schedule-users/<schedule_id>")
def get_schedule_users(schedule_id):
    """Get all users for a particular schedule."""
    
    data = list()
    if session.get("user", 0):
        users = crud.get_schedule_users_by_schedule_id(schedule_id)
        schedule = crud.get_schedule_by_id(schedule_id)

        for user in users:
            if session["user"] == (user.user_id) or session["user"] == schedule.user_id:
                for user in users:
                    user_ = crud.get_user_by_id(user.user_id)
                    data.append({"user_id": user_.user_id, 
                                "username": user_.username, 
                                "image_path": user_.image_path})
                break
        
    return jsonify(data)


@app.route("/remove-user-from-schedule/<schedule_id>/<user_id>", methods=["POST"])
def remove_user_from_schedule(schedule_id, user_id):
    """Remove a user from a schedule."""

    flash = ""
    if session.get("user", 0):
        schedule = crud.get_schedule_by_id(schedule_id)
        if session["user"] == schedule.user_id:
            crud.remove_user_from_schedule(schedule_id, user_id)
            flash = "kicked."
        else:
            flash = "You must be the schedule host to kick a user"
    else:
        flash = "You must be signed in to kick a user."

    return flash


@app.route("/leave-schedule/<schedule_id>", methods=["POST"])
def leave_schedule(schedule_id):
    """Leave a schedule as a user."""

    flash = ""
    if session.get("user", 0):
        if crud.isUserinSchedule(session["user"], schedule_id):
            crud.remove_user_from_schedule(schedule_id, session["user"])
            flash = "Left Schedule"
        else:
            flash = "You must be a user in the schedule to leave."

    else:
        flash = "You must be logged in to leave a schedule."

    return flash


@app.route("/delete-schedule/<schedule_id>", methods=["POST"])
def delete_schedule(schedule_id):
    """Delete a schedule as host."""

    flash = ""
    if session.get("user", 0):
        schedule = crud.get_schedule_by_id(schedule_id)
        if session["user"] == schedule.user_id:
            crud.delete_schedule(schedule_id)
            flash = "Schedule Deleted"
        else:
            flash = "You must be the host to delete the schedule."
    else:
        flash = "You must be signed in to delete a schedule."

    return flash


@app.route("/admin/<path>")
def view_admin_display(path):
    """View admin information."""

    data = list()

    if path == "users":
        users = crud.get_users()
        for user in users:
            data.append({"user_id": user.user_id,
                    "username": user.username,
                    "firstname": user.first_name,
                    "lastname": user.last_name,
                    "email": user.email,
                    "password": user.password,
                    "image_path": user.image_path})
    elif path == "games":
        games = crud.get_games()
        for game in games:
            data.append({"game_id": game.game_id,
                        "name": game.name,
                        "icon_path": game.icon_path,
                        "image_path": game.image_path})        
    elif path == "schedules":
        schedules = crud.get_schedules()
        for schedule in schedules:
            data.append({"schedule_id": schedule.schedule_id,
                        "user_id": schedule.user_id,
                        "game_id": schedule.game_id,
                        "isArchived": schedule.isArchived} )       
    elif path == "requests":
        requests = crud.get_requests()
        for request in requests:
            data.append({"request_id": request.schedule_id,
                        "user_id": request.user_id,
                        "game_id": request.game_id,
                        "schedule_id": request.schedule_id})  
    elif path == "schedule-users":
        schedule_users = crud.get_schedule_users()
        for su in schedule_users:
            data.append({"schedule_users_id": su.schedule_users_id,
                        "schedule_id": su.schedule_id,
                        "user_id": su.user_id}) 
    elif path == "posts":
        posts = crud.get_posts()
        for post in posts:
            data.append({"post_id": post.post_id,
                        "schedule_id": post.schedule_id,
                        "user_id": post.user_id})         
    elif path == "platforms":
        platforms = crud.get_platforms()
        for platform in platforms:
            data.append({"platform_id": platform.platform_id,
                        "game_id": platform.game_id,
                        "name": platform.name})     
    else:
        data = None                        

    return jsonify(data)



if __name__ == "__main__":
    connect_to_db(app)
    app.run(host="0.0.0.0", debug=True)    
from flask import Flask, render_template, request, flash, session, redirect, jsonify
from model import connect_to_db
from jinja2 import StrictUndefined
import crud
from datetime import datetime
import requests
import json

app = Flask(__name__)
app.secret_key = "secret"
app.jinja_env.undefined = StrictUndefined

igdb = {
    'client_id': '761m6x4eageu6w69f5tnxamjtufjgv',
    'client_secret': 'tmmr6zuwv5rovvzh4ifvkx0t5v5hog',
    'grant_type': "client_credentials"
}

igdb_token = 'https://id.twitch.tv/oauth2/token?'
igdb_baseURL = 'https://api.igdb.com/v4/'

for key, value in igdb.items():
    if key == 'client_id':
        igdb_token += f'{key}={value}'
    else:
        igdb_token += f'&{key}={value}'

API_response = requests.post(igdb_token)
API_response_json = API_response.json()

igdb_header = {
    'content-type': 'application/json',
    'Client-ID': '761m6x4eageu6w69f5tnxamjtufjgv',
    'Authorization': 'Bearer '+API_response_json['access_token']
}

# age_ratings,aggregated_rating,aggregated_rating_count,alternative_names,artworks,bundles,category,
# checksum,collection,cover,created_at,dlcs,expanded_games,expansions,external_games,first_release_date,
# follows,forks,franchise,franchises,game_engines,game_modes,genres,hypes,involved_companies,keywords,
# multiplayer_modes,name,parent_game,platforms,player_perspectives,ports,rating,rating_count,release_dates,
# remakes,remasters,screenshots,similar_games,slug,standalone_expansions,status,storyline,summary,tags,themes,
# total_rating,total_rating_count,updated_at,url,version_parent,version_title,videos,websites

fields = 'fields name, game_modes.name, artworks.url, platforms.name, first_release_date;'
limit = ' limit 20;'
where = ' where game_modes != 1;'
search = ''

@app.route('/')
def homepage():
    """View homepage."""

    return render_template('homepage.html')

@app.route('/game-info.json', methods=["GET"])
def get_game_info():
    """Get game info from an igdb API call."""
   
    data = request.args.get('search')
    search = ' search \"'+data+'\";'
    results = requests.post('https://api.igdb.com/v4/games', headers=igdb_header, data=fields+limit+where+search)
    results_json = results.json()

    print("------------------IGDB API call----------------->")
    for result in results_json:
        print(result)

    #print(results_json)

    #game modes
    #fields1 = "fields checksum,created_at,name,slug,updated_at,url;"
    #gamemodes = requests.post('https://api.igdb.com/v4/game_modes', headers=igdb_header, data=fields1)
    #print(gamemodes.json())

    #artwork
    #fields2 = "fields alpha_channel,animated,checksum,game,height,image_id,url,width;"
    #artwork = requests.post('https://api.igdb.com/v4/game_modes', headers=igdb_header, data=fields2)
    #print(artwork.json())

    return json.dumps(results_json)


@app.route('/add-user', methods=["POST"])
def add_user():
    """Create a new user."""

    username = request.form.get("username")
    fname = request.form.get("fname")
    lname = request.form.get("lname")
    email = request.form.get("email")
    password = request.form.get("password")

    if crud.get_user_by_username(username):
        flash = "Username already exist."
    elif crud.get_user_by_email(email):
        flash = "User's email already exist."
    elif username == '' or email == '' or password == '':
        flash = "Username, email and password is required."
    else:
        crud.create_user(username, fname, lname, email, password)
        flash = "User created. Please log in."

    return flash


@app.route('/login', methods=["POST"])
def log_in():
    """Find user and log in user to session."""

    email = request.form.get("email")
    password = request.form.get("password")
    user = crud.get_user_by_email(email)
    user_email = ''

    if email == '' or password == '':
        flash = "All field input is required."
        status = "0"
    elif user:
        if user.password == password:
            session['user'] = user.user_id
            flash = f'Logged in as {user.username}'
            user_email = user.email
            status = "1"    
        else:
            flash = "Password is incorrect."
            status = "0"
    else:
        flash = "Email has not been registered."
        status = "0"

    data = {'flash': flash, "status": status, "email": user_email}

    return jsonify(data)


@app.route('/logout', methods=["POST"])
def log_out():
    """View log in page."""
    
    #get id='log' html element to be 'log out', else render log in 
    if session.get('user', 0):
        session.pop('user')
        flash = "You have been logged out."
        status = "1"
    else:
        flash = "You are already logged out."
        status = "0"

    data = {'flash': flash, "status": status}

    return jsonify(data)


@app.route('/profile', methods=["GET"])
def get_user():
    """Get logged user profile page."""

    if session.get('user',0):
        user = crud.get_user_by_id(session['user'])
        data = {"user_id": user.user_id,
                "username": user.username, 
                "firstname": user.first_name, 
                "lastname": user.last_name,
                "image_path": user.image_path,
                "email": user.email,
                "password": user.password}

        return jsonify(data)
    
    return "None"


@app.route('/user-schedules', methods=["GET"])
def get_user_schedules():
    """Get logged user schedules."""
    
    data_list = list()

    if session.get('user',0):
        schedules = crud.get_schedules_by_user_id(session['user'])

        for schedule in schedules:
            game = crud.get_game_by_id(schedule.game_id)
            host = crud.get_user_by_id(schedule.user_id)

            data = {"type": "host",
                    "host_username": host.username,
                    "schedule_id": schedule.schedule_id,
                    "game_id": schedule.game_id,
                    "game_name": game.name,
                    "datetime": schedule.datetime, 
                    "timezone": schedule.timezone, 
                    "platform": schedule.platform,
                    "max_user": schedule.max_user,
                    "max_team": schedule.max_team,
                    "description": schedule.description}
            data_list.append(data)

        schedules_user = crud.get_schedule_users_by_user_id(session['user'])
        for schedule_user in schedules_user:
            schedule = crud.get_schedule_by_id(schedule_user.schedule_id)
            game = crud.get_game_by_id(schedule.game_id)
            host = crud.get_user_by_id(schedule.user_id)

            data = {"type": "user",
                    "host_username": host.username,
                    "schedule_id": schedule.schedule_id,
                    "game_id": schedule.game_id,
                    "game_name": game.name,
                    "datetime": schedule.datetime, 
                    "timezone": schedule.timezone, 
                    "platform": schedule.platform,
                    "max_user": schedule.max_user,
                    "max_team": schedule.max_team,
                    "description": schedule.description}
            data_list.append(data)            

    return jsonify(data_list)


@app.route('/user-requests', methods=["GET"])
def get_user_requests():
    """Get logged user sent and received requests."""
    
    data_list = list()

    if session.get('user',0):
        requests = crud.get_requests_by_user_id(session['user'])
        
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

        schedules = crud.get_schedules_by_user_id(session['user'])
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
                        "content": request.content}

                data_list.append(data)

    return jsonify(data_list)


@app.route('/user-posts', methods=["GET"])
def get_user_posts():
    """Get logged user posts."""
    
    data_list = list()
    posts = crud.get_posts_by_user_id(session['user'])

    for post in posts:
        data = {"post_id": post.post_id,
                "schedule_id": post.schedule_id,
                "time_stamp": post.time_stamp,
                "content": post.content}

        data_list.append(data)

    return jsonify(data_list)


@app.route('/create-schedule', methods=["POST"])
def create_schedule():
    """Create a schedule."""

    status = 'fail'
    game_id = request.form.get("game")
    date = request.form.get("date")
    time = request.form.get("time")
    timezone = request.form.get("timezone")
    platform = request.form.get("platform")
    description = request.form.get("description")
    max_user = request.form.get("max_user")
    max_team = request.form.get("max_team")
    schedule_id = 0
    if max_team == '':
        max_team = 0

    if session.get('user', 0):
        if description != '' and max_user != '' and date != '' and time != '':
            date_ = date.split('-')
            datetime_date = datetime(int(date_[0]), int(date_[1]), int(date_[2]))
            time_ = datetime.strptime(time,'%H:%M').time()
            date_time = datetime.combine(datetime_date, time_)
            schedule = crud.add_schedule(session['user'], 
                                        game_id, 
                                        date_time, 
                                        timezone, 
                                        platform, 
                                        description, 
                                        max_user, 
                                        max_team)
            schedule_id = schedule.schedule_id
            flash = "Schedule has been submitted."
            status = 'success'
        else:
            flash = "All (*) field input is required."
    else:
        flash = "You need to be logged in to create a schedule."
        
    return jsonify({"flash": flash, "status": status, "schedule_id": schedule_id})


@app.route('/create-schedule-from-gamedb/<game_id>', methods=["POST"])
def create_schedule_from_gamedb(game_id):
    """Create a schedule from a particular game."""

    if crud.hasGame(game_id):
        game = crud.get_game_by_id(game_id)
        data = {
            "game_id": game.game_id,
            "game_name": game.name
        }
        
        return data

    return "None"


@app.route('/create-schedule-by-search-game', methods=["POST"])
def create_schedule_by_search_game():
    """Create a schedule by using the game search API. (via game_name)"""

    status = 'fail'
    game_name = request.form.get("game")
    image_path = request.form.get("image_path")
    date = request.form.get("date")
    time = request.form.get("time")
    timezone = request.form.get("timezone")
    platform = request.form.get("platform")
    description = request.form.get("description")
    max_user = request.form.get("max_user")
    max_team = request.form.get("max_team")
    schedule_id = 0
    if max_team == '':
        max_team = 0

    if session.get('user', 0):
        if description != '' and max_user != '' and date != '' and time != '':
            date_ = date.split('-')
            datetime_date = datetime(int(date_[0]), int(date_[1]), int(date_[2]))
            time_ = datetime.strptime(time,'%H:%M').time()
            date_time = datetime.combine(datetime_date, time_)
            game = crud.add_game(game_name, image_path)
            game_id = game.game_id
            schedule = crud.add_schedule(session['user'], 
                                        game_id, 
                                        date_time, 
                                        timezone, 
                                        platform, 
                                        description, 
                                        max_user, 
                                        max_team)
            schedule_id = schedule.schedule_id
            flash = "Schedule has been submitted."
            status = 'success'
        else:
            flash = "All (*) field input is required."
    else:
        flash = "You need to be logged in to create a schedule."
        
    return jsonify({"flash": flash, "status": status, "schedule_id": schedule_id})


@app.route('/get-schedules', methods=["GET"])
def get_schedules():
    """Get all schedules."""

    username = request.args.get("username")
    game_name = request.args.get("game_name")
    date = request.args.get("date")
    time = request.args.get("time") 
    data = list()

    if username == '' and game_name == '' and date == '' and time == '':
        schedules = crud.get_schedules()

    else:
        formData = {"username": username,
                    "game_name": game_name,
                    "date": date,
                    "time": time}
        schedules = crud.get_schedules_by_criteria(formData)

    for schedule in schedules:
        user = crud.get_user_by_id(schedule.user_id)
        game = crud.get_game_by_id(schedule.game_id)
        data.append({"schedule_id": schedule.schedule_id,
                    "user_id": schedule.user_id,
                    "username": user.username,
                    "game_id": schedule.game_id,
                    "game_name": game.name,
                    "datetime": schedule.datetime,
                    "timezone": schedule.timezone,
                    "platform": schedule.platform,
                    "description": schedule.description,
                    "max_user": schedule.max_user,
                    "max_team": schedule.max_team})

    return jsonify(data)


@app.route('/get-games', methods=["GET"])
def get_games():
    """Get all games."""

    game_name = request.args.get("game_name")
    data = list()
    print(game_name)
    if game_name == '' or game_name == None:
        games = crud.get_games()

    else:
        formData = {"game_name": game_name}
        games = crud.get_games_by_criteria(formData)

    for game in games:
        data.append({"name": game.name, 
                    "game_id": game.game_id, 
                    "image_path": game.image_path})

    return jsonify(data)


@app.route('/get-game/<name>', methods=["GET"])
def get_game(name):
    """Get a game by id."""

    data = list()

    if crud.hasGame_by_name(name):
        game = crud.get_game_by_name(name)
        data = {"name": game.name, "game_id": game.game_id}


    return jsonify(data)


@app.route('/get-timezones', methods=["GET"])
def get_timezones():
    """Get all timezones in a <select> tag."""

    parseString = ''
    file = open('timezones.txt')
    for line in file:
        string = line.rstrip()
        parseString += string

    return parseString
   

@app.route('/get-posts/<schedule_id>', methods=["GET"])
def get_posts_by_schedule_id(schedule_id):
    """Get posts in schedule_id."""

    data = list()
    posts = crud.get_posts_by_schedule_id(schedule_id)

    for post in posts:
        user = crud.get_user_by_id(post.user_id)
        data.append({"post_id": post.post_id, 
                    "schedule_id": post.schedule_id, 
                    "user_id": post.user_id,
                    "username": user.username,
                    "image_path": user.image_path,
                    "time_stamp": post.time_stamp,
                    "content": post.content})

    return jsonify(data)


@app.route('/add-post', methods=["POST"])
def add_post():
    """Add a post."""

    flash = ''
    user_id = request.form.get("user_id")
    schedule_id = request.form.get("schedule_id")
    content = request.form.get("content")

    if session.get('user', 0):
        if(session['user'] == user_id):
            flash = 'You must be logged in.'
        else:
            crud.add_post(user_id, schedule_id, content)
            flash = 'Message has been posted.'

    return flash


@app.route('/get-schedule-user-status/<schedule_id>', methods=["GET"])
def get_schedule_user_status(schedule_id):
    """Get user status for a schedule."""

    status = ''
    schedule = crud.get_schedule_by_id(schedule_id)    

    if session.get('user', 0):
        if(session['user'] == schedule.user_id):
            status = 'host'
        elif crud.hasRequested(schedule_id, session['user']):
            status = 'requested'
        else:
            schedule_users = crud.get_schedule_users_by_schedule_id(schedule_id)
            status = 'not approved'
            
            for user in schedule_users:
                if(user.user_id == session['user']):
                    status = 'approved'
                    break
    else:
        status = 'error: you must be signed in.'

    return status


@app.route('/request/<schedule_id>', methods=["POST"])
def add_request(schedule_id):
    """Add a request to the schedule_id."""

    flash = ''
    user_id = request.form.get("user_id")
    schedule_id = request.form.get("schedule_id")
    content = request.form.get("content")
    schedule = crud.get_schedule_by_id(schedule_id)

    if session.get('user', 0):
        if session['user'] == schedule.user_id:
            flash = "You cannot send a request as a host."
        elif crud.hasRequested(schedule_id, session['user']):
            flash = "You have already submitted a request for this schedule."
        elif crud.isScheduleUser(schedule_id, session['user']):
            flash ="You are already an approved user for this schedule."      
        else:
            crud.add_request(session['user'], schedule_id, content)
            flash = "Request submitted."

    else:
        flash = "You must be logged in to submit a request."

    return flash


@app.route('/get-requests/<schedule_id>', methods=["GET"])
def get_requests_by_schedule_id(schedule_id):
    """Get all requests for schedule_id."""

    if session.get('user', 0):

        data = list()
        schedule = crud.get_schedule_by_id(schedule_id)
        if session['user'] == schedule.user_id:
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


@app.route('/approve-request/<request_id>', methods=["POST"])
def approve_request(request_id):
    """Approve a request."""  

    if session.get('user', 0):
        request = crud.get_request_by_id(request_id)
        schedule = crud.get_schedule_by_id(request.schedule_id)  
        if session['user'] == schedule.user_id:
            crud.add_user_to_schedule(schedule.schedule_id, request.user_id)
            crud.remove_request(request_id)
            flash = "User added to this schedule."
        else:
            flash = "You are not authorized to approve the request."
    else:
        flash = "You must be logged in to approve the request."

    return flash


@app.route('/decline-request/<request_id>', methods=["POST"])
def decline_request(request_id):
    """Disapprove a request."""
    
    if session.get('user', 0):
        request = crud.get_request_by_id(request_id)
        schedule = crud.get_schedule_by_id(request.schedule_id)
        if session['user'] == schedule.user_id:
            crud.remove_request(request_id)
            flash = "User has been declined."
        else:
            flash = "You are not authorized to approve the request."
    else:
        flash = "You must be logged in to decline the request."

    return flash


@app.route('/get-schedule-users/<schedule_id>')
def get_schedule_users(schedule_id):
    """Get all users for a particular schedule."""
    
    data = list()
    if session.get('user', 0):
        users = crud.get_schedule_users_by_schedule_id(schedule_id)
        schedule = crud.get_schedule_by_id(schedule_id)

        for user in users:
            if session['user'] == user.user_id or session['user'] == schedule.user_id:
                for user in users:
                    user_ = crud.get_user_by_id(user.user_id)
                    data.append({"user_id": user.user_id, 
                                "username": user_.username, 
                                "image_path": user_.image_path})
            break
        
    return jsonify(data)


@app.route('/remove-user-from-schedule/<schedule_id>/<user_id>', methods=["POST"])
def remove_user_from_schedule(schedule_id, user_id):
    """Remove a user from a schedule."""

    flash = ''
    if(session.get('user')):
        schedule = crud.get_schedule_by_id(schedule_id)
        if session['user'] == schedule.user_id:
            crud.remove_user_from_schedule(schedule_id, user_id)
            flash = 'kicked.'
        else:
            flash = 'You must be the schedule host to kick a user'
    else:
        flash = 'You must be signed in to kick a user.'

    return flash


@app.route('/admin/<path>')
def view_admin_display(path):
    """View admin information."""

    data = list()

    if path == 'users':
        users = crud.get_users()
        for user in users:
            data.append({"users_id": user.user_id,
                    "username": user.username,
                    "firstname": user.first_name,
                    "lastname": user.last_name,
                    "email": user.email,
                    "password": user.password,
                    "image_path": user.image_path})
    elif path == 'games':
        games = crud.get_games()
        for game in games:
            data.append({"game_id": game.game_id,
                        "name": game.name,
                        "image_path": game.image_path})        
    elif path == 'schedules':
        schedules = crud.get_schedules()
        for schedule in schedules:
            data.append({"schedule_id": schedule.schedule_id,
                        "user_id": schedule.user_id,
                        "game_id": schedule.game_id})        
    elif path == 'requests':
        requests = crud.get_requests()
        for request in requests:
            data.append({"request_id": request.schedule_id,
                        "user_id": request.user_id,
                        "game_id": request.game_id,
                        "schedule_id": request.schedule_id})  
    elif path == 'schedule-users':
        schedule_users = crud.get_schedule_users()
        for su in schedule_users:
            data.append({"schedule_users_id": su.schedule_users_id,
                        "schedule_id": su.schedule_id,
                        "user_id": su.user_id}) 
    elif path == 'posts':
        posts = crud.get_posts()
        for post in posts:
            data.append({"post_id": post.post_id,
                        "schedule_id": post.schedule_id,
                        "user_id": post.user_id})         
    else:
        data = None                        

    return jsonify(data)







if __name__ == '__main__':
    connect_to_db(app)
    app.run(host='0.0.0.0', debug=True)    
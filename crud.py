from model import db, User, Game, Schedule, Request, Post, Schedule_Users, connect_to_db, Platform
from datetime import datetime
from sqlalchemy import func, Time, cast, text

#-----------------Add Wrappers------------------------------->
def create_user(username, fname, lname, email, password, image_path='/static/img/avator-placeholder.jpg'):
    """Create and return a new user."""

    if image_path == '':
        image_path = '/static/img/avator-placeholder.jpg'

    user = User(username=username, first_name=fname, last_name=lname, image_path=image_path, email=email, password=password)
    db.session.add(user)
    db.session.commit()

    return user


def add_game(name, image_path='/static/img/game-url-not-found.jpg', icon_path='/static/img/icon-not-found.png'):
    """Add a game."""

    game = Game(name=name, image_path=image_path, icon_path=icon_path)
    db.session.add(game)
    db.session.commit()

    return game


def add_schedule(user_id, game_id, datetime, timezone, platform_id, description, max_user, max_team=1):
    """Add a schedule."""

    schedule = Schedule(user_id=user_id,
                        game_id=game_id,
                        datetime=datetime, 
                        timezone=timezone, 
                        platform_id=platform_id, 
                        description=description, 
                        max_user=max_user, 
                        max_team=max_team)
    db.session.add(schedule)
    db.session.commit()

    return schedule


def add_user_to_schedule(schedule_id, user_id):
    """Add a user to a schedule."""

    schedule_user = Schedule_Users(schedule_id=schedule_id, user_id=user_id)
    db.session.add(schedule_user)
    db.session.commit()   

    return schedule_user


def add_request(user_id, schedule_id, msg):
    """Add a request."""

    schedule = get_schedule_by_id(schedule_id)
    request = Request(user_id=user_id, 
                    game_id=schedule.game_id, 
                    schedule_id=schedule_id,
                    time_stamp=datetime.now(), 
                    content=msg)
    db.session.add(request)
    db.session.commit()

    return request


def add_post(user_id, schedule_id, content):
    """Add a post."""
    
    post = Post(user_id=user_id, schedule_id=schedule_id, time_stamp=datetime.now(), content=content)
    db.session.add(post)
    db.session.commit()
    
    return post 


def add_platform(game_id, platform_name):
    """Add a platform."""

    platform = Platform(game_id=game_id, name=platform_name)
    db.session.add(platform)
    db.session.commit()

    return platform


#-----------------Get Wrappers------------------------------->
def get_platforms():
    """Get all platforms."""

    return Platform.query.all()


def get_platform_by_id(platform_id):
    """Get platform by id."""

    return Platform.query.filter(Platform.platform_id == platform_id).first()


def get_platform_by_name(platform_name):
    """Get platform by id."""

    return Platform.query.filter(Platform.name == platform_name).first()


def get_game_platforms_by_id(game_id):
    """Get all platforms of a game."""

    return Platform.query.filter(Platform.game_id == game_id).all()


def get_users():
    """Return all users."""

    return User.query.all()


def get_user_by_email(email):
    """Return a user by email."""

    return User.query.filter(User.email == email).first()


def get_user_by_username(username):
    """Return a user by username."""

    return User.query.filter(User.username == username).first()


def get_user_by_id(user_id):
    """Return a user by id."""

    return User.query.filter(User.user_id == user_id).first()


def get_games():
    """Return all games."""

    return Game.query.all()


def get_game_by_id(game_id):
    """Return a game by id."""

    return Game.query.filter(Game.game_id == game_id).first()


def get_game_by_name(name):
    """Return a game by name."""

    return Game.query.filter(Game.name == name).first()


def get_games_by_criteria(formData, limit_size=20, offset_num=0):
    """Get games by criteria."""

    if formData["game_name"] == '' and (formData["sort_by"] == '' or formData["sort_by"] == None):
        return Game.query.limit(limit_size).offset(offset_num)
    
    elif formData["game_name"] != '' and formData["sort_by"] == "alphabetical":
        return Game.query.filter(Game.name.ilike('%'+formData["game_name"]+'%')).order_by(Game.name.asc()).limit(limit_size).offset(offset_num)

    elif formData["game_name"] != '' and formData["sort_by"] == "most-active":
        return Game.query.outerjoin(Schedule).filter(Game.name.ilike('%'+formData["game_name"]+'%')).group_by(Game.game_id).order_by(func.count(Game.game_id).desc()).limit(limit_size).offset(offset_num)

    elif formData["game_name"] != '' and (formData["sort_by"] == '' or formData["sort_by"] == None):
        return Game.query.filter(Game.name.ilike('%'+formData["game_name"]+'%')).limit(limit_size).offset(offset_num)

    elif formData["game_name"] == '' and formData["sort_by"] == "alphabetical":
        return Game.query.order_by(Game.name.asc()).limit(limit_size).offset(offset_num)

    elif formData["game_name"] == '' and formData["sort_by"] == "most-active":
        return Game.query.outerjoin(Schedule).group_by(Game.game_id).order_by(func.count(Game.game_id).desc()).limit(limit_size).offset(offset_num)


def get_games_by_criteria_count(formData):
    """Return the size of the query."""

    if formData["game_name"] == '' and (formData["sort_by"] == '' or formData["sort_by"] == None):
        return Game.query.count()
    
    elif formData["game_name"] != '' and formData["sort_by"] == "alphabetical":
        return Game.query.filter(Game.name.ilike('%'+formData["game_name"]+'%')).count()

    elif formData["game_name"] != '' and formData["sort_by"] == "most-active":
        return Game.query.filter(Game.name.ilike('%'+formData["game_name"]+'%')).count()

    elif formData["game_name"] != '' and (formData["sort_by"] == '' or formData["sort_by"] == None):
        return Game.query.filter(Game.name.ilike('%'+formData["game_name"]+'%')).count()

    elif formData["game_name"] == '' and formData["sort_by"] == "alphabetical":
        return Game.query.count()

    elif formData["game_name"] == '' and formData["sort_by"] == "most-active":
        return Game.query.count()


def get_schedules():
    """Return all schedules."""

    return Schedule.query.all()


def get_schedules_active():
    """ Return all non archived schedules."""

    return Schedule.query.filter(Schedule.isArchived == False).all()


def get_schedule_by_id(schedule_id):    
    """Return a schedule from schedule_id."""

    return Schedule.query.filter(Schedule.schedule_id == schedule_id).first()


def get_schedules_by_game_id(game_id):
    """Return all schedules by game_id."""

    return Schedule.query.filter(Schedule.game_id == game_id).all()


def get_schedules_by_user_id(user_id, limit_size=10, offset_num=0):
    """Return all schedules by user_id."""

    return Schedule.query.filter((Schedule.user_id == user_id) & (Schedule.isArchived == False)).limit(limit_size).offset(offset_num)


def get_schedules_by_user_id_count(user_id):
    """Return the size of the query."""

    return Schedule.query.filter((Schedule.user_id == user_id) & (Schedule.isArchived == False)).count()


def get_archived_schedules_by_user_id(user_id, limit_size=10, offset_num=0):
    """Return all schedules created by user_id."""

    return Schedule.query.filter((Schedule.user_id == user_id) & (Schedule.isArchived == True)).limit(limit_size).offset(offset_num)


def get_archived_schedules_by_user_id_count(user_id):
    """Return the size of the query."""

    return Schedule.query.filter((Schedule.user_id == user_id) & (Schedule.isArchived == True)).count()


def get_schedules_by_criteria(formData, limit_size=10, offset_num=0):
    """Return schedules by criterias."""

    username = formData["username"]
    game_name = formData["game_name"]
    date = formData["date"]
    time = formData["time"]

    if formData["username"] == '' and formData["game_name"] == '' and formData["date"] == '' and formData["time"] == '':
        return Schedule.query.filter(Schedule.isArchived == False).limit(limit_size).offset(offset_num)

    elif formData["username"] != '' and formData["game_name"] != '' and formData["date"] != '' and formData["time"] != '':
        date_time = datetime.strptime(date+" "+time, "%Y-%m-%d %H:%M")
        return Schedule.query.join(User).join(Game).filter(User.username.ilike('%'+username+'%')).filter(Game.name.ilike('%'+game_name+'%')).filter(Schedule.datetime == date_time).filter(Schedule.isArchived == False).limit(limit_size).offset(offset_num)

    elif formData["username"] != '' and formData["game_name"] != '' and formData["time"] != '':
        return Schedule.query.join(User).join(Game).filter(User.username.ilike('%'+username+'%')).filter(Game.name.ilike('%'+game_name+'%')).filter(cast(Schedule.datetime, Time) == time).filter(Schedule.isArchived == False).limit(limit_size).offset(offset_num)

    elif formData["username"] != '' and formData["game_name"] != '' and formData["date"] != '':
        return Schedule.query.join(User).join(Game).filter(User.username.ilike('%'+username+'%')).filter(Game.name.ilike('%'+game_name+'%')).filter(func.DATE(Schedule.datetime) == date).filter(Schedule.isArchived == False).limit(limit_size).offset(offset_num)

    elif formData["username"] != '' and formData["date"] != '' and formData["time"] != '':
        date_time = datetime.strptime(date+" "+time, "%Y-%m-%d %H:%M")
        return Schedule.query.join(User).filter(User.username.ilike('%'+username+'%')).filter(Schedule.datetime == date_time).filter(Schedule.isArchived == False).limit(limit_size).offset(offset_num)

    elif formData["game_name"] != '' and formData["date"] != '' and formData["time"] != '':
        date_time = datetime.strptime(date+" "+time, "%Y-%m-%d %H:%M")
        return Schedule.query.join(Game).filter(Game.name.ilike('%'+game_name+'%')).filter(Schedule.datetime == date_time).filter(Schedule.isArchived == False).limit(limit_size).offset(offset_num)

    elif formData["username"] != '' and formData["game_name"] != '':
        return Schedule.query.join(User).join(Game).filter(User.username.ilike('%'+username+'%')).filter(Game.name.ilike('%'+game_name+'%')).filter(Schedule.isArchived == False).limit(limit_size).offset(offset_num)

    elif formData["username"] != '' and formData["date"] != '':
        return Schedule.query.join(User).filter(User.username.ilike('%'+username+'%')).filter(func.DATE(Schedule.datetime) == date).filter(Schedule.isArchived == False).limit(limit_size).offset(offset_num)

    elif formData["username"] != '' and formData["time"] != '':
        return Schedule.query.join(User).filter(User.username.ilike('%'+username+'%')).filter(cast(Schedule.datetime, Time) == time).filter(Schedule.isArchived == False).limit(limit_size).offset(offset_num)

    elif formData["game_name"] != '' and formData["date"] != '':
        return Schedule.query.join(Game).filter(Game.name.ilike('%'+game_name+'%')).filter(func.DATE(Schedule.datetime) == date).filter(Schedule.isArchived == False).limit(limit_size).offset(offset_num)

    elif formData["game_name"] != '' and formData["time"] != '':
        return Schedule.query.join(Game).filter(Game.name.ilike('%'+game_name+'%')).filter(cast(Schedule.datetime, Time) == time).filter(Schedule.isArchived == False).limit(limit_size).offset(offset_num)

    elif formData["date"] != '' and formData["time"] != '':
        date_time = datetime.strptime(date+" "+time, "%Y-%m-%d %H:%M")
        return Schedule.query.filter(Schedule.datetime == date_time).filter(Schedule.isArchived == False).limit(limit_size).offset(offset_num)

    elif formData["username"] != '':
        return Schedule.query.join(User).filter(User.username.ilike('%'+username+'%')).filter(Schedule.isArchived == False).limit(limit_size).offset(offset_num)

    elif formData["game_name"] != '':
        return Schedule.query.join(Game).filter(Game.name.ilike('%'+game_name+'%')).filter(Schedule.isArchived == False).limit(limit_size).offset(offset_num)

    elif formData["date"] != '':
        return Schedule.query.filter(func.DATE(Schedule.datetime) == date).filter(Schedule.isArchived == False).limit(limit_size).offset(offset_num)

    elif formData["time"] != '':
        return Schedule.query.filter(cast(Schedule.datetime, Time) == time).filter(Schedule.isArchived == False).limit(limit_size).offset(offset_num)

    else:
        return "Error"

    
def get_schedules_count(formData):
    """Return the count of the schedules (num of rows)."""

    username = formData["username"]
    game_name = formData["game_name"]
    date = formData["date"]
    time = formData["time"]

    if formData["username"] == '' and formData["game_name"] == '' and formData["date"] == '' and formData["time"] == '':
        return Schedule.query.filter(Schedule.isArchived == False).count()

    elif formData["username"] != '' and formData["game_name"] != '' and formData["date"] != '' and formData["time"] != '':
        date_time = datetime.strptime(date+" "+time, "%Y-%m-%d %H:%M")
        return Schedule.query.join(User).join(Game).filter(User.username.ilike('%'+username+'%')).filter(Game.name.ilike('%'+game_name+'%')).filter(Schedule.datetime == date_time).filter(Schedule.isArchived == False).count()

    elif formData["username"] != '' and formData["game_name"] != '' and formData["time"] != '':
        return Schedule.query.join(User).join(Game).filter(User.username.ilike('%'+username+'%')).filter(Game.name.ilike('%'+game_name+'%')).filter(cast(Schedule.datetime, Time) == time).filter(Schedule.isArchived == False).count()

    elif formData["username"] != '' and formData["game_name"] != '' and formData["date"] != '':
        return Schedule.query.join(User).join(Game).filter(User.username.ilike('%'+username+'%')).filter(Game.name.ilike('%'+game_name+'%')).filter(func.DATE(Schedule.datetime) == date).filter(Schedule.isArchived == False).count()

    elif formData["username"] != '' and formData["date"] != '' and formData["time"] != '':
        date_time = datetime.strptime(date+" "+time, "%Y-%m-%d %H:%M")
        return Schedule.query.join(User).filter(User.username.ilike('%'+username+'%')).filter(Schedule.datetime == date_time).filter(Schedule.isArchived == False).count()

    elif formData["game_name"] != '' and formData["date"] != '' and formData["time"] != '':
        date_time = datetime.strptime(date+" "+time, "%Y-%m-%d %H:%M")
        return Schedule.query.join(Game).filter(Game.name.ilike('%'+game_name+'%')).filter(Schedule.datetime == date_time).filter(Schedule.isArchived == False).count()

    elif formData["username"] != '' and formData["game_name"] != '':
        return Schedule.query.join(User).join(Game).filter(User.username.ilike('%'+username+'%')).filter(Game.name.ilike('%'+game_name+'%')).filter(Schedule.isArchived == False).count()

    elif formData["username"] != '' and formData["date"] != '':
        return Schedule.query.join(User).filter(User.username.ilike('%'+username+'%')).filter(func.DATE(Schedule.datetime) == date).filter(Schedule.isArchived == False).count()

    elif formData["username"] != '' and formData["time"] != '':
        return Schedule.query.join(User).filter(User.username.ilike('%'+username+'%')).filter(cast(Schedule.datetime, Time) == time).filter(Schedule.isArchived == False).count()

    elif formData["game_name"] != '' and formData["date"] != '':
        return Schedule.query.join(Game).filter(Game.name.ilike('%'+game_name+'%')).filter(func.DATE(Schedule.datetime) == date).filter(Schedule.isArchived == False).count()

    elif formData["game_name"] != '' and formData["time"] != '':
        return Schedule.query.join(Game).filter(Game.name.ilike('%'+game_name+'%')).filter(cast(Schedule.datetime, Time) == time).filter(Schedule.isArchived == False).count()

    elif formData["date"] != '' and formData["time"] != '':
        date_time = datetime.strptime(date+" "+time, "%Y-%m-%d %H:%M")
        return Schedule.query.filter(Schedule.datetime == date_time).filter(Schedule.isArchived == False).count()

    elif formData["username"] != '':
        return Schedule.query.join(User).filter(User.username.ilike('%'+username+'%')).filter(Schedule.isArchived == False).count()

    elif formData["game_name"] != '':
        return Schedule.query.join(Game).filter(Game.name.ilike('%'+game_name+'%')).filter(Schedule.isArchived == False).count()

    elif formData["date"] != '':
        return Schedule.query.filter(func.DATE(Schedule.datetime) == date).filter(Schedule.isArchived == False).count()

    elif formData["time"] != '':
        return Schedule.query.filter(cast(Schedule.datetime, Time) == time).filter(Schedule.isArchived == False).count()

    else:
        return "Error"


def get_requests():
    """Return all requests."""

    return Request.query.all()


def get_request_by_id(request_id):
    """Return a request by request_id."""

    return Request.query.filter(Request.request_id == request_id).first()


def get_requests_by_game_id(game_id):
    """Return requests by game_id."""

    return Request.query.filter(Request.game_id == game_id).all() 


def get_requests_by_user_id(user_id):
    """Return requests by user_id."""

    return Request.query.filter(Request.user_id == user_id).all() 


def get_requests_by_schedule_id(schedule_id):
    """Return requests from schedule_id."""

    return Request.query.filter(Request.schedule_id == schedule_id).all()


def get_posts():
    """Return all posts."""

    return Post.query.all()


def get_posts_by_user_id(user_id, limit_size=10, offset_num=0):
    """Return all posts by user_id."""

    return Post.query.filter(Post.user_id == user_id).limit(limit_size).offset(offset_num)


def get_posts_by_user_id_count(user_id):
    """Return all posts by user_id."""

    return Post.query.filter(Post.user_id == user_id).count()


def get_posts_by_schedule_id(schedule_id, limit_size=10, offset_num=0):
    """Return all posts from schedule_id."""

    return Post.query.filter(Post.schedule_id == schedule_id).limit(limit_size).offset(offset_num)


def get_posts_by_schedule_id_count(schedule_id):
    """Return the size of the query."""

    return Post.query.filter(Post.schedule_id == schedule_id).count()


def get_schedule_users():
    """Return all user waitlists for all schedules."""

    return Schedule_Users.query.all()


def get_schedule_users_by_game_id(game_id):
    """Return all user waitlists for a game_id."""

    return Schedule_Users.query.filter(Schedule_Users.game_id == game_id).all()


def get_schedule_users_by_schedule_id(schedule_id):
    """Return the user waitlists for a schedule_id."""

    return Schedule_Users.query.filter(Schedule_Users.schedule_id == schedule_id).all()


def get_schedule_users_by_user_id(user_id, limit_size=10, offset_num=0):
    """Return schedules associated with user as user."""

    return Schedule_Users.query.filter(Schedule_Users.user_id == user_id).limit(limit_size).offset(offset_num)


def get_schedule_users_by_user_id_count(user_id):
    """Return size of query."""

    return Schedule_Users.query.filter(Schedule_Users.user_id == user_id).count()


#-----------------Set Wrappers------------------------------->
def set_game_image_by_game_id(game_id, image_path):
    """Set image in a game and return true if successful and false if failed."""

    if Game.query.get(game_id):
        game = Game.query.filter(Game.game_id == game_id).update({"image_path": image_path})
        db.session.commit()
    
    return Game.query.filter(Game.game_id == game_id).first()


def set_game_image_by_name(game_name, image_path):
    """Set image in a game and return true if successful and false if failed."""

    if get_game_by_name(game_name):
        Game.query.filter(Game.name == game_name).update({"image_path": image_path})
        db.session.commit()
    
    return Game.query.filter(Game.name == game_name).first()


def set_game_icon_by_game_id(game_id, icon_path):
    """Set icon in a game and return true if successful and false if failed."""

    if Game.query.get(game_id):
        game = Game.query.filter(Game.game_id == game_id).update({"icon_path": icon_path})
        db.session.commit()
    
    return Game.query.filter(Game.game_id == game_id).first()


def set_game_icon_by_name(game_name, icon_path):
    """Set icon in a game and return true if successful and false if failed."""

    if get_game_by_name(game_name):
        Game.query.filter(Game.name == game_name).update({"icon_path": icon_path})
        db.session.commit()
    
    return Game.query.filter(Game.name == game_name).first()


def set_schedule_archived_by_id(schedule_id):
    """Set a schedule to archived."""

    if Schedule.query.get(schedule_id):
        schedule = Schedule.query.filter(Schedule.schedule_id == schedule_id).update({"isArchived": True})
        db.session.commit()
        return True

    return False


def set_user_profile(user_id, fname, lname, password, image_path):
    """Set user profile firstname, lastname, email and password."""

    if User.query.get(user_id):
        User.query.filter(User.user_id == user_id).update({"first_name": fname, "last_name": lname, "password": password, "image_path": image_path})
        db.session.commit()
        return True
    
    return False

def set_user_image(user_id, image_path):
    """Set user's image."""

    if User.query.get(user_id):
        User.query.filter(User.user_id == user_id).update({"image_path": image_path})
        db.session.commit()
        return True
    
    return False


#-----------------Boolean Wrappers------------------------------->
def isScheduleUser(schedule_id, user_id):
    """Check if a user is in a schedule_id's waitlist."""

    schedule_queue = get_schedule_users_by_schedule_id(schedule_id)

    if schedule_queue != None:
        for user in schedule_queue:
            if user.user_id == user_id:
                return True

    return False


def hasRequested(schedule_id, user_id):
    """Check if a user has already made a request to a schedule."""

    schedule = get_schedule_by_id(schedule_id)

    for request_ in schedule.requests:
        if request_.user_id == user_id:
                return True

    return False


def hasGame(game_id):
    """Check if a game exist in the db."""

    if Game.query.filter(Game.game_id == game_id).first():
        return True
    
    return False


def hasGame_by_name(game_name):
    """Check if a game exist in the db."""

    if Game.query.filter(Game.name == game_name).first():
        return True
    
    return False


def isUserinSchedule(user_id, schedule_id):
    """Check if a user is in a schedule."""

    schedule = Schedule_Users.query.filter((Schedule_Users.user_id == user_id) & (Schedule_Users.schedule_id == schedule_id)).first()
    if schedule:
        return True

    return False


def hasPlatform(platform_name):
    """Check if db already has the platform."""

    if get_platform_by_name(platform_name):
        return True
    
    return False

#-----------------Remove Wrappers------------------------------->
def remove_request(request_id):
    """Remove a request from request_id."""

    db.session.delete(Request.query.filter(Request.request_id == request_id).first())
    db.session.commit() 


def remove_user_from_schedule(schedule_id, user_id):
    """Remove a user from a schedule."""

    schedule_user = Schedule_Users.query.filter((Schedule_Users.schedule_id == schedule_id) & (Schedule_Users.user_id == user_id)).first()
    db.session.delete(schedule_user)
    db.session.commit()


def delete_schedule(schedule_id):
    """Delete a schedule by id, along with it's requests."""

    schedule = Schedule.query.filter(Schedule.schedule_id == schedule_id).first()

    for request in schedule.requests:
        db.session.delete(request)

    s_u = Schedule_Users.query.filter(Schedule_Users.schedule_id == schedule_id).first()
    if s_u:
        db.session.delete(s_u)

    db.session.delete(schedule)
    db.session.commit()


#-----------------Count Wrappers------------------------------->
def count_schedules():
    """Get the count of schedules."""

    return Schedule.query.count()


def count_requests():
    """Get the count of requets."""

    return Request.query.count()


#-----------------Misc Wrappers------------------------------->
def get_users_by_schedule_id(schedule_id):
    """Get the users from a schedule."""

    return User.query.join(Schedule_Users, Schedule_Users.user_id==User.user_id).filter(Schedule_Users.schedule_id == schedule_id).all()



if __name__ == '__main__':
    from server import app

    connect_to_db(app)
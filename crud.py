from model import db, User, Game, Schedule, Request, Post, Schedule_Users, connect_to_db
from datetime import datetime

#-----------------Add Wrappers------------------------------->
def create_user(username, fname, lname, email, password, image_path='/static/img/avator-placeholder.jpg'):
    """Create and return a new user."""

    user = User(username=username, first_name=fname, last_name=lname, image_path=image_path, email=email, password=password)
    db.session.add(user)
    db.session.commit()

    return user


def add_game(name, url):
    """Add a game."""

    game = Game(name=name, image_path=url)
    db.session.add(game)
    db.session.commit()

    return game


def add_schedule(user_id, game_id, datetime, timezone, platform, description, max_user, max_team=1):
    """Add a schedule."""

    schedule = Schedule(user_id=user_id,
                        game_id=game_id,
                        datetime=datetime, 
                        timezone=timezone, 
                        platform=platform, 
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


#-----------------Get Wrappers------------------------------->
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


def get_schedules():
    """Return all schedules."""

    return Schedule.query.all()


def get_schedule_by_id(schedule_id):    
    """Return a schedule from schedule_id."""

    return Schedule.query.filter(Schedule.schedule_id == schedule_id).first()


def get_schedules_by_game_id(game_id):
    """Return all schedules by game_id."""
    return Schedule.query.filter(Schedule.game_id == game_id).all()


def get_schedules_by_user_id(user_id):
    """Return all schedules by user_id."""

    return Schedule.query.filter(Schedule.user_id == user_id).all()


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


def get_posts_by_user_id(user_id):
    """Return all posts by user_id."""

    return Post.query.filter(Post.user_id == user_id).all()


def get_posts_by_schedule_id(schedule_id):
    """Return all posts from schedule_id."""

    return Post.query.filter(Post.schedule_id == schedule_id).all()


def get_schedule_users():
    """Return all user waitlists for all schedules."""

    return Schedule_Users.query.all()


def get_schedule_users_by_game_id(game_id):
    """Return all user waitlists for a game_id."""

    return Schedule_Users.query.filter(Schedule_Users.game_id == game_id).all()


def get_schedule_users_by_schedule_id(schedule_id):
    """Return the user waitlists for a schedule_id."""

    return Schedule_Users.query.filter(Schedule_Users.schedule_id == schedule_id).all()


def get_schedule_users_by_user_id(user_id):
    """Return schedules associated with user as user."""

    return Schedule_Users.query.filter(Schedule_Users.user_id == user_id).all()


#-----------------Set Wrappers------------------------------->
def set_game_image_by_game_id(game_id, image_path):
    """Set image in a game and return true if successful and false if failed."""

    if Game.query.get(game_id):
        Game.query.filter(Game.game_id == game_id).update({"image_path":image_path})
        db.session.commit()
    else:
        return False
    
    return True


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


#-----------------Remove Wrappers------------------------------->
def remove_request(request_id):
    """Remove a request from request_id."""

    db.session.delete(Request.query.filter(Request.request_id == request_id).first())
    db.session.commit() 


if __name__ == '__main__':
    from server import app

    connect_to_db(app)
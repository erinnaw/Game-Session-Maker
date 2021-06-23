from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

def connect_to_db(flask_app, db_uri='postgresql:///scheduler', echo=True):
    flask_app.config['SQLALCHEMY_DATABASE_URI'] = db_uri
    flask_app.config['SQLALCHEMY_ECHO'] = echo
    flask_app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    db.app = flask_app
    db.init_app(flask_app)

    print('Connected to the db!')


class User(db.Model):
    """A user."""

    __tablename__ = 'users'

    user_id = db.Column(db.Integer,
                        autoincrement=True,
                        primary_key=True)
    username = db.Column(db.String,
                         unique=True,
                         nullable=False)
    image_path = db.Column(db.String)
    first_name = db.Column(db.String)
    last_name = db.Column(db.String)
    email = db.Column(db.String,
                      unique=True,
                      nullable=False)
    password = db.Column(db.String,
                        nullable=False)
    schedule_users_id = db.Column(db.Integer,
                                    db.ForeignKey('schedule_users.schedule_users_id'))                  

    schedules = db.relationship('Schedule')
    posts = db.relationship('Post')
    requests = db.relationship('Request')

    def __repr__(self):
        return f'<User_id={self.user_id} username={self.username} first_name={self.first_name} last_name={self.last_name} email={self.email} password={self.password}>'


class Game(db.Model):
    """A Game."""

    __tablename__ = 'games'

    game_id = db.Column(db.Integer,
                        autoincrement=True,
                        primary_key=True)
    name = db.Column(db.String, 
                    unique=True)
    image_path = db.Column(db.String)                                                          

    schedules = db.relationship('Schedule')
    requests = db.relationship('Request')
    platforms = db.relationship('Platform')

    def __repr__(self):
        return f'<game_id={self.game_id} name={self.name} image_path={self.image_path}>'


class Platform(db.Model):
    """A Platform."""

    __tablename__ = 'platforms'

    platform_id = db.Column(db.Integer,
                            autoincrement=True,
                            primary_key=True)
    game_id = db.Column(db.Integer,
                        db.ForeignKey('games.game_id'))
    name = db.Column(db.String)
    games = db.relationship('Game', viewonly=True)
    schedules = db.relationship('Schedule')

    def __repr__(self):
        return f'<platform_id={self.platform_id} name={self.name}>'


class Schedule(db.Model):
    """A schedule."""

    __tablename__ = 'schedules'

    schedule_id = db.Column(db.Integer,
                            autoincrement=True,
                            primary_key=True)
    user_id = db.Column(db.Integer,
                        db.ForeignKey('users.user_id'))
    game_id = db.Column(db.Integer,
                        db.ForeignKey('games.game_id'))         
    platform_id = db.Column(db.Integer,
                        db.ForeignKey('platforms.platform_id'))            
    datetime = db.Column(db.DateTime,
                        nullable=False)
    timezone = db.Column(db.String,
                        nullable=False)
    description = db.Column(db.Text,
                        nullable=False)
    max_user = db.Column(db.Integer,
                        nullable=False)
    max_team = db.Column(db.Integer)
    isArchived = db.Column(db.Boolean, 
                        default=False,
                        nullable=False)

    requests = db.relationship('Request')
    posts = db.relationship('Post')
    schedule_users = db.relationship('Schedule_Users', cascade="all, delete")

    def __repr__(self):
        return f'<schedule_id={self.schedule_id} user_id={self.user_id} game_id={self.game_id} datetime={self.datetime} timezone={self.timezone} platform={self.platform} description={self.description} max_user={self.max_user} max_team={self.max_team}>'


class Request(db.Model):
    """A request."""

    __tablename__ = 'requests'

    request_id = db.Column(db.Integer,
                            autoincrement=True,
                            primary_key=True)
    user_id = db.Column(db.Integer,
                        db.ForeignKey('users.user_id'))
    game_id = db.Column(db.Integer,
                        db.ForeignKey('games.game_id'))
    schedule_id = db.Column(db.Integer,
                            db.ForeignKey('schedules.schedule_id'))
    time_stamp = db.Column(db.DateTime)
    content = db.Column(db.Text,
                        nullable=False)

    def __repr__(self):
        return f'<request_id={self.request_id} user_id={self.user_id} game_id={self.game_id} schedule_id={self.schedule_id} content={self.content}>'


class Post(db.Model):
    """A post."""

    __tablename__ = 'posts'

    post_id = db.Column(db.Integer,
                        autoincrement=True,
                        primary_key=True)
    schedule_id = db.Column(db.Integer,
                            db.ForeignKey('schedules.schedule_id'))
    user_id = db.Column(db.Integer,
                        db.ForeignKey('users.user_id'))
    time_stamp = db.Column(db.DateTime)
    content = db.Column(db.Text,
                        nullable=False)

    def __repr__(self):
        return f'<post_id={self.post_id} schedule_id={self.schedule_id} user_id={self.user_id} time_stamp={self.time_stamp} content={self.content}>'
    

class Schedule_Users(db.Model):
    """A waitlist for users in a schedule."""

    __tablename__ = 'schedule_users'

    schedule_users_id = db.Column(db.Integer,
                                autoincrement=True,
                                primary_key=True)
    schedule_id = db.Column(db.Integer,
                            db.ForeignKey('schedules.schedule_id'))
    user_id = db.Column(db.Integer,
                            db.ForeignKey('users.user_id'))

    def __repr__(self):
        return f'<schedule_users_id={self.schedule_users_id} schedule_id={self.schedule_id} user_id={self.user_id}>'


if __name__ == '__main__':
    from server import app

    # Call connect_to_db(app, echo=False) if your program output gets
    # too annoying; this will tell SQLAlchemy not to print out every
    # query it executes.

    connect_to_db(app)

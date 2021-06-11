"use strict";

$(document).ready(function () {

    let key = new String();
    let new_href = new String();

    for (let i = 0; i < window.location.href.length; i++) {

        if (window.location.href[i] === "#") {

            key = window.location.href.slice(i);
            new_href = window.location.href.slice(0, i);
            break;
        }
    }

    if(key === "#loggedin") {

        $.get('/profile', (res) => {

            $('#snackbar').html(`You have signed signed in with ${res.email}.`);
            document.getElementById("snackbar").className = "show";
            setTimeout(function () { document.getElementById("snackbar").className = document.getElementById("snackbar").className.replace("show", ""); }, 3000);

        });
    }

    else if (key === "#loggedout") {

        $.get('/profile', (res) => {

            $('#snackbar').html("You have signed out.");
            document.getElementById("snackbar").className = "show";
            setTimeout(function () { document.getElementById("snackbar").className = document.getElementById("snackbar").className.replace("show", ""); }, 3000);
        })
    }
});

$('.homepage-menu-item').hover(
    
    (evt) => {
        evt.target.style.background = "black";
        evt.target.style.color = "white";

    }, 

    (evt) => {
        evt.target.style.removeProperty('background');
        evt.target.style.removeProperty('color');
    }
);

$('#create-account').on('click', () => {

    $('#homepage-display').html("<div class=\"subheader\" id=\"subheader\">Create Account</div>");
    $('#homepage-display').append("<form class = \"registration-form\" id = \"registration-form\" action = \"/create-user\" method = \"POST\"></form>");
    $('#registration-form').append("<div class=\"grid-registration\" id=\"registration\"></div>");
    $('#registration').append(
        "<Label for=\"username\">Username*</Label>"+
        "<input type =\"text\" name=\"username\" id=\"username\">"+
        "<Label for=\"fname\">First Name</Label>"+
        "<input type =\"text\" name=\"fname\" id=\"fname\">"+
        "<Label for=\"lname\">Last Name</Label>"+
        "<input type =\"text\" name=\"lname\" id=\"lname\">"+
        "<Label for=\"email\">Email*</Label>" +
        "<input type =\"text\" name=\"email\" id=\"email\">" +
        "<Label for= \"password\">Password*</Label>" +
        "<input type=\"password\" name=\"password\" id=\"password\">" +
        "<div></div>" +
        "<input type=\"submit\" value=\"Submit\">" +
        "<div></div>* required fields" +
        "<div class=\"flash-msg\" id=\"flash-msg\"></div>");
     
    $('#registration-form').on('submit', (evt) => {
        
        evt.preventDefault();
        const formData = {
            "username": $('#username').val(),
            "fname": $('#fname').val(),
            "lname": $('#lname').val(),
            "email": $('#email').val(),
            "password": $('#password').val()
        };

        $.post('/add-user', formData, (res) => {

            $('#flash-msg').html(res);
        })
    });
});

$('#log-in').on('click', () => {

    $('#homepage-display').html("<div class=\"subheader\" id=\"subheader\">Log In</div>");
    $('#homepage-display').append("<form class = \"login-form\" id = \"login-form\" action = \"/login\" method = \"POST\"></form>");
    $('#login-form').append("<div class=\"grid-login\" id=\"login\"></div>");
    $('#login').append(
        "<Label for=\"email\">Email</Label>" +
        "<input type =\"text\" name=\"email\" id=\"email\">" +
        "<Label for= \"password\">Password</Label>" +
        "<input type=\"password\" name=\"password\" id=\"password\">" +
        "<div></div>" +
        "<input type=\"submit\" value=\"Submit\">" +
        "<div class=\"flash-msg\" id=\"flash-msg\"></div>");

    $('#login-form').on('submit', (evt) => {
        
        evt.preventDefault();
        const formData = {
            "email": $('#email').val(),
            "password": $('#password').val()
        };

        $.post('/login', formData, (res) => {
            
            $('#flash-msg').html(res["flash"]);
            
            if(res.status === "1") {

                let key = new String();
                let new_href = new String();

                for (let i = 0; i < window.location.href.length; i++) {

                    if (window.location.href[i] === "#") {
                        new_href = window.location.href.slice(0, i);
                        break;
                    }
                }

                window.location = new_href + "#loggedin";
                window.location.reload();
            }
        });
    });
});

$('#log-out').on('click', () => {

    $.post('/logout', (res) => {

        $('#flash-msg').html(res["flash"]);
        
        let key = new String();
        let new_href = new String();

        for (let i = 0; i < window.location.href.length; i++) {

            if (window.location.href[i] === "#") {
                new_href = window.location.href.slice(0, i);
                break;
            }
        }

        window.location = new_href + "#loggedout";
        window.location.reload();
    });
});

$('#create-schedule').on('click', () => {

    $.get('/profile', (user) => {
        if(user === "None") {
            $('#homepage-display').html("<div class=\"error-page\" id=\"error-page\">You must be signed in to create a schedule.</div>");
        }
        else {
            $('#homepage-display').html("<div class=\"subheader\" id=\"subheader\">Create a Schedule</div>");
            $('#homepage-display').append("<form class=\"schedule-form\" id=\"schedule-form\" action=\"/create-schedule\" method=\"POST\"></form>");
            $('#schedule-form').append("<div class=\"grid-create-schedule-form\" id=\"create-schedule-form\"></div>");
            $('#create-schedule-form').append("<Label for=\"game\">Game*</Label><select name=\"game\" id=\"game-select\"></select>");

            $.get('/get-games', (games) => {
                for (const game of games) {

                    name = game.name.charAt(0).toUpperCase() + game.name.slice(1);
                    $('#game-select').append(`<option value=${game.game_id}>${name}</option>`);
                }
            });

            $('#create-schedule-form').append("<Label for=\"date\">Date*</Label>" +
                "<input type=\"date\" name=\"date\" id=\"date\">" +
                "<Label for=\"time\">Time*</Label>" +
                "<input type=\"time\" name=\"time\" id=\"time\">" +
                "<Label for=\"timezone\">Timezone*</Label>" +
                "<div class=\"tz\" id=\"tz\"></div>");

            $.get('/get-timezones', (str) => {
                $('#tz').append(str);
            });

            $('#create-schedule-form').append("<Label for=\"platform\">Platform</Label>" +
                "<select name=\"platform\" id=\"platform\">" +
                "<option value=\"pc\">PC</option>" +
                "<option value=\"playstation4\">Playstation</option>" +
                "<option value=\"Xbox\">Xbox</option>" +
                "<option value=\"Nintendo\">Nintendo</option>" +
                "</select>");

            $('#create-schedule-form').append("<Label for=\"max_user\">Max Users*</Label>" +
                "<input type=\"number\" min=\"1\" step=\"1\" name=\"max_user\" id=\"max_user\">" +
                "<Label for=\"max_team\">Max Teams</Label>" +
                "<input type=\"number\" min=\"1\" step=\"1\" name=\"max_team\" id=\"max_team\" placeholder=\"1\">" +
                "<Label for=\"description\">Description*</Label>" +
                "<textarea name=\"description\" id=\"description\" rows=\"10\" cols=\"50\">Write requirements for users and description of your objective(s).</textarea> " +
                "<div></div>" +
                "<input type=\"submit\" value=\"Submit\">" +
                "<div></div>" +
                "*required fields");

            $('#homepage-display').append("<div class=\"flash-msg\" id=\"flash-msg\"></div");

            $('#schedule-form').on('submit', (evt) => {

                const formData = $('#schedule-form').serialize();       
                evt.preventDefault();

                $.post('/create-schedule', formData, (data) => {

                    if(data.status === "fail") {
                        $('#flash-msg').html(data.flash);
                    }
                    else {
                        $('#snackbar').html(`${data.flash}`);
                        document.getElementById("snackbar").className = "show";
                        setTimeout(function () { document.getElementById("snackbar").className = document.getElementById("snackbar").className.replace("show", ""); }, 3000);
                        $('#all-schedules').trigger('click');
                    }
                });                       
            });
        }
    });
});

$('#all-schedules').on('click', () => {

    $('#homepage-display').html("<div class=\"subheader\" id=\"subheader\">All Schedules</div>");
    $('#homepage-display').append("<div class=\"grid-display-schedules\" id=\"display-schedules\"></div>");

    $.get('/get-schedules', (schedules) => {

        for (const schedule of schedules) {

            $('#display-schedules').append(`<div class=\"grid-display-schedule-item\" id=\"schedule-item-${schedule.schedule_id}\"></div>`);
            $(`#schedule-item-${schedule.schedule_id}`).append(`<div class=\"profile-schedules-item-text\">Host:</div><div class=\"profile-schedules-item-text\">${schedule.username}</div>`);
            $(`#schedule-item-${schedule.schedule_id}`).append(`<div class=\"profile-schedules-item-text\">Schedule ID:</div><div class=\"profile-schedules-item-text\">${schedule.schedule_id}</div>`);
            $(`#schedule-item-${schedule.schedule_id}`).append(`<div class=\"profile-schedules-item-text\">Game ID:</div><div class=\"profile-schedules-item-text\">${schedule.game_id}</div>`);
            $(`#schedule-item-${schedule.schedule_id}`).append(`<div class=\"profile-schedules-item-text\">Game Name:</div><div class=\"profile-schedules-item-text\">${schedule.game_name}</div>`);
            $(`#schedule-item-${schedule.schedule_id}`).append(`<div class=\"profile-schedules-item-text\">Schedule ID:</div><div class=\"profile-schedules-item-text\">${schedule.schedule_id}</div>`);
            $(`#schedule-item-${schedule.schedule_id}`).append(`<div class=\"profile-schedules-item-text\">Schedule Date/Time::</div><div class=\"profile-schedules-item-text\">${schedule.datetime}</div>`);
            $(`#schedule-item-${schedule.schedule_id}`).append(`<div class=\"profile-schedules-item-text\">Schedule Timezone:</div><div class=\"profile-schedules-item-text\">${schedule.timezone}</div>`);
            $(`#schedule-item-${schedule.schedule_id}`).append(`<div class=\"profile-schedules-item-text\">Platform:</div><div class=\"profile-schedules-item-text\">${schedule.platform}</div>`);
            $(`#schedule-item-${schedule.schedule_id}`).append(`<div class=\"profile-schedules-item-text\">Max User:</div><div class=\"profile-schedules-item-text\">${schedule.max_user}</div>`);
            $(`#schedule-item-${schedule.schedule_id}`).append(`<div class=\"profile-schedules-item-text\">Max Team:</div><div class=\"profile-schedules-item-text\">${schedule.max_team}</div>`);
            $(`#schedule-item-${schedule.schedule_id}`).append(`<div class=\"profile-schedules-item-text\">Description:</div><div class=\"profile-schedules-item-text\">${schedule.description}</div>`);
            $(`#schedule-item-${schedule.schedule_id}`).append(`<div></div><div class=\"view-schedule-button\" id=\"schedule-${schedule.schedule_id}\">view</div>`)
        }

        $('.view-schedule-button').hover(

            (evt) => {
                evt.target.style.background = "black";
                evt.target.style.color = "white";

            },

            (evt) => {
                evt.target.style.removeProperty('background');
                evt.target.style.removeProperty('color');
            }
        );
        
        $('.view-schedule-button').on('click', (evt) => {

            
            for (const schedule of schedules) {

                if(schedule.schedule_id == parseInt(evt.target.id.slice(9))) {

                    $('#homepage-display').html(`<div class=\"subheader\" id=\"subheader\">Schedule ID: ${schedule.schedule_id}</div>`);
                    $('#homepage-display').append("<div class=\"grid-display-schedules\" id=\"display-schedules\"></div>");
                    $('#display-schedules').append(`<div class=\"grid-display-schedule-item\" id=\"schedule-item-${schedule.schedule_id}\"></div>`);
                    $(`#schedule-item-${schedule.schedule_id}`).append(`<div class=\"profile-schedules-item-text\">Host:</div><div class=\"profile-schedules-item-text\">${schedule.username}</div>`);
                    $(`#schedule-item-${schedule.schedule_id}`).append(`<div class=\"profile-schedules-item-text\">Schedule ID:</div><div class=\"profile-schedules-item-text\">${schedule.schedule_id}</div>`);
                    $(`#schedule-item-${schedule.schedule_id}`).append(`<div class=\"profile-schedules-item-text\">Game ID:</div><div class=\"profile-schedules-item-text\">${schedule.game_id}</div>`);
                    $(`#schedule-item-${schedule.schedule_id}`).append(`<div class=\"profile-schedules-item-text\">Game Name:</div><div class=\"profile-schedules-item-text\">${schedule.game_name}</div>`);
                    $(`#schedule-item-${schedule.schedule_id}`).append(`<div class=\"profile-schedules-item-text\">Schedule ID:</div><div class=\"profile-schedules-item-text\">${schedule.schedule_id}</div>`);
                    $(`#schedule-item-${schedule.schedule_id}`).append(`<div class=\"profile-schedules-item-text\">Schedule Date/Time::</div><div class=\"profile-schedules-item-text\">${schedule.datetime}</div>`);
                    $(`#schedule-item-${schedule.schedule_id}`).append(`<div class=\"profile-schedules-item-text\">Schedule Timezone:</div><div class=\"profile-schedules-item-text\">${schedule.timezone}</div>`);
                    $(`#schedule-item-${schedule.schedule_id}`).append(`<div class=\"profile-schedules-item-text\">Platform:</div><div class=\"profile-schedules-item-text\">${schedule.platform}</div>`);
                    $(`#schedule-item-${schedule.schedule_id}`).append(`<div class=\"profile-schedules-item-text\">Max User:</div><div class=\"profile-schedules-item-text\">${schedule.max_user}</div>`);
                    $(`#schedule-item-${schedule.schedule_id}`).append(`<div class=\"profile-schedules-item-text\">Max Team:</div><div class=\"profile-schedules-item-text\">${schedule.max_team}</div>`);
                    $(`#schedule-item-${schedule.schedule_id}`).append(`<div class=\"profile-schedules-item-text\">Description:</div><div class=\"profile-schedules-item-text\">${schedule.description}</div>`);


                    $.get(`/get-schedule-user-status/${schedule.schedule_id}`, (status) => {

                        if(status === "host") {

                            $(`#schedule-item-${schedule.schedule_id}`).append(`<div></div><div class=\"view-requests-button\" id=\"view-requests-${schedule.schedule_id}\">View Requests</div>`);

                            $('.view-requests-button').hover(

                                (evt) => {
                                    evt.target.style.background = "black";
                                    evt.target.style.color = "white";

                                },

                                (evt) => {
                                    evt.target.style.removeProperty('background');
                                    evt.target.style.removeProperty('color');
                                }
                            );

                            $(`#view-requests-${schedule.schedule_id}`).on('click', () => {

                                $('#homepage-display').append(`<div class=\"grid-display-requests\" id=\"display-requests-${schedule.schedule_id}\"></div>`);

                                $.get(`/get-requests/${schedule.schedule_id}`, (requests) => {

                                    if(requests.slice(0,5) === "Error"){
                                    
                                        $(`#display-requests-${schedule.schedule_id}`).html(`<div class=\"error-page\" id=\"error-page\">${requests}</div>`);
                                    }
                                    else{

                                        $('#homepage-display').html(`<div class=\"subheader\" id=\"subheader\">Schedule ID: ${schedule.schedule_id}</div>`);
                                        $('#homepage-display').append("<div class=\"grid-display-schedules\" id=\"display-schedules\"></div>");
                                        $('#display-schedules').append(`<div class=\"grid-display-schedule-item\" id=\"schedule-item-${schedule.schedule_id}\"></div>`);
                                        $(`#schedule-item-${schedule.schedule_id}`).append(`<div class=\"profile-schedules-item-text\">Host:</div><div class=\"profile-schedules-item-text\">${schedule.username}</div>`);
                                        $(`#schedule-item-${schedule.schedule_id}`).append(`<div class=\"profile-schedules-item-text\">Schedule ID:</div><div class=\"profile-schedules-item-text\">${schedule.schedule_id}</div>`);
                                        $(`#schedule-item-${schedule.schedule_id}`).append(`<div class=\"profile-schedules-item-text\">Game ID:</div><div class=\"profile-schedules-item-text\">${schedule.game_id}</div>`);
                                        $(`#schedule-item-${schedule.schedule_id}`).append(`<div class=\"profile-schedules-item-text\">Game Name:</div><div class=\"profile-schedules-item-text\">${schedule.game_name}</div>`);
                                        $(`#schedule-item-${schedule.schedule_id}`).append(`<div class=\"profile-schedules-item-text\">Schedule ID:</div><div class=\"profile-schedules-item-text\">${schedule.schedule_id}</div>`);
                                        $(`#schedule-item-${schedule.schedule_id}`).append(`<div class=\"profile-schedules-item-text\">Schedule Date/Time::</div><div class=\"profile-schedules-item-text\">${schedule.datetime}</div>`);
                                        $(`#schedule-item-${schedule.schedule_id}`).append(`<div class=\"profile-schedules-item-text\">Schedule Timezone:</div><div class=\"profile-schedules-item-text\">${schedule.timezone}</div>`);
                                        $(`#schedule-item-${schedule.schedule_id}`).append(`<div class=\"profile-schedules-item-text\">Platform:</div><div class=\"profile-schedules-item-text\">${schedule.platform}</div>`);
                                        $(`#schedule-item-${schedule.schedule_id}`).append(`<div class=\"profile-schedules-item-text\">Max User:</div><div class=\"profile-schedules-item-text\">${schedule.max_user}</div>`);
                                        $(`#schedule-item-${schedule.schedule_id}`).append(`<div class=\"profile-schedules-item-text\">Max Team:</div><div class=\"profile-schedules-item-text\">${schedule.max_team}</div>`);
                                        $(`#schedule-item-${schedule.schedule_id}`).append(`<div class=\"profile-schedules-item-text\">Description:</div><div class=\"profile-schedules-item-text\">${schedule.description}</div>`);

                                        $(`#homepage-display`).append(`<div class=\"grid-display-requests-canvas\" id=\"requests-${schedule.schedule_id}\"></div>`);

                                        for(const request of requests) {

                                            $(`#requests-${schedule.schedule_id}`).append(`<div class=\"grid-display-request-item\" id=\"request-item-${schedule.schedule_id}\"></div>`);
                                            $(`#request-item-${schedule.schedule_id}`).html(`<div class=\"post-avator\" id=\"post-avator-${request.user_id}\"></div>`);
                                            $(`#post-avator-${request.user_id}`).append(`<img class=\"avator-img\" id=\"avator-img-${request.user_id}\" src=\"${request.image_path}\"></img>`);
                                            $(`#post-avator-${request.user_id}`).append(`<div class=\"avator-name\" id=\"avator-name-${request.user_id}\">${request.username}</div>`);

                                            $(`#request-item-${schedule.schedule_id}`).append(`<div class=\"grid-request-content\" id=\"request-content-${request.request_id}\"></div>`);
                                            $(`#request-content-${request.request_id}`).append(`<div class=\"grid-request-header\" id=\"request-header-${request.request_id}\">Request Message</div>`);
                                            $(`#request-content-${request.request_id}`).append(`<div class=\"postmsgbox\">${request.content}</div>`);
                                            $(`#request-content-${request.request_id}`).append(`<div class=\"timestamp\" id=\"timestamp-request-${request.request_id}\">${request.time_stamp}</div>`);

                                            $(`#request-item-${schedule.schedule_id}`).append(`<div class=\"grid-approval\" id=\"approval-${request.request_id}\"></div>`);
                                            $(`#approval-${request.request_id}`).append(`<div class=\"approve-button\" id=\"approve-button-${request.request_id}\">Approve</div>`);
                                            $(`#approval-${request.request_id}`).append(`<div class=\"decline-button\" id=\"decline-button-${request.request_id}\">Decline</div>`);

                                            $('.approve-button').hover(

                                                (evt) => {
                                                    evt.target.style.background = "green";
                                                },

                                                (evt) => {
                                                    evt.target.style.removeProperty('background');
                                                }
                                            );

                                            $('.decline-button').hover(

                                                (evt) => {
                                                    evt.target.style.background = "red";
                                                },

                                                (evt) => {
                                                    evt.target.style.removeProperty('background');
                                                }
                                            );

                                            $(`#approve-button-${request.request_id}`).on('click', () => {

                                                $.post(`/approve-request/${request.request_id}`, (msg) => {

                                                    $('#snackbar').html(`${msg}`);
                                                    document.getElementById("snackbar").className = "show";
                                                    setTimeout(function () { document.getElementById("snackbar").className = document.getElementById("snackbar").className.replace("show", ""); }, 3000);
                                                    
                                                    $(`#decline-button-${request.request_id}`).replaceWith("<div class=\"decline\" id=\"decline\">Decline</div>");
                                                    $(`#approve-button-${request.request_id}`).replaceWith("<div class=\"approved\" id=\"approved\">Approved</div>");
                                                });
                                            });

                                            $(`#decline-button-${request.request_id}`).on('click', () => {

                                                $.post(`/decline-request/${request.request_id}`, (msg) => {

                                                    $('#snackbar').html(`${msg}`);
                                                    document.getElementById("snackbar").className = "show";
                                                    setTimeout(function () { document.getElementById("snackbar").className = document.getElementById("snackbar").className.replace("show", ""); }, 3000);
                                                                                      
                                                    $(`#decline-button-${request.request_id}`).replaceWith("<div class=\"declined\" id=\"declined\">Declined</div>");
                                                    $(`#approve-button-${request.request_id}`).replaceWith("<div class=\"approve\" id=\"approve\">Approve</div>");
                                                });
                                            });
                                        }
                                    }
                                });
                            });
                        }
                        else if(status === "requested") {

                            $(`#schedule-item-${schedule.schedule_id}`).append(`<div></div><div class=\"requested-button\" id=\"requested-${schedule.schedule_id}\">Requested</div>`);
                        }
                        else if(status === "approved") {

                            $(`#schedule-item-${schedule.schedule_id}`).append(`<div></div><div class=\"approved-button\" id=\"approved-${schedule.schedule_id}\">Approved</div>`);
                        }
                        else if(status === "not approved") {

                            $(`#schedule-item-${schedule.schedule_id}`).append(`<div></div><div class=\"request-button\" id=\"request-${schedule.schedule_id}\">Request</div>`);
                            $(`#schedule-item-${schedule.schedule_id}`).append("<div id=\"myModal\" class=\"modal\">" +
                                "<div class=\"modal-content\">" +
                                "<span class=\"close\">&times;</span>" +
                                "<div class=\"grid-request-form\" id=\"request-form\"></div>" +
                                "</div></div>")

                            $.get('/profile', (user) => {

                                if(user === "None") {
                                    $('#request-form').html("<div class=\"error-page\" id=\"error-page\">You must be signed in.</div>")
                                }
                                else {
                                    $('#request-form').html(`<div class=\"post-avator\" id=\"avatorboxreq-${user.user_id}\"></div>`);
                                    $(`#avatorboxreq-${user.user_id}`).append(`<img class=\"avator-img\" id=\"avatorimgreq-${user.user_id}\" src=\"${user.image_path}\"></img>`);
                                    $(`#avatorboxreq-${user.user_id}`).append(`<div class=\"avator-name\" id=\"avatornamereq-${user.user_id}\">${user.username}</div>`);

                                    $('#request-form').append("<div class=\"grid-request-inner\" id=\"request-inner\"></div>");
                                    $('#request-inner').append("<div class=\"grid-request-header\" id=\"request-header\">Request</div>");
                                    $('#request-inner').append(`<form class=\"grid-requestform\" method=\"POST\" id=\"requestform\"></form>`);
                                    $('#requestform').append("<textarea name=\"description\" id=\"request-content\" rows=\"8\" cols=\"50\"></textarea>" +
                                        "<input type=\"submit\" value=\"submit\">");
                                    $('#request-inner').append("<div class=\"flash-msg\" id=\"flash-msg-request\"></div>");

                                    $('#requestform').on('submit', (evt) => {

                                        evt.preventDefault();

                                        if (document.querySelector('#request-content').value == '') {

                                            $('#flash-msg-request').html("Message cannot be blank.");
                                        }
                                        else {
                                            const formData = {
                                                "user_id": user.user_id,
                                                "schedule_id": schedule.schedule_id,
                                                "content": $('#request-content').val()
                                            }

                                            $.post(`/request/${schedule.schedule_id}`, formData, (msg) => {

                                                $('#snackbar').html(`${msg}`);
                                                document.getElementById("snackbar").className = "show";
                                                setTimeout(function () { document.getElementById("snackbar").className = document.getElementById("snackbar").className.replace("show", ""); }, 3000);
                                                $('.view-schedule-button').trigger("click");
                                                $(`#request-${schedule.schedule_id}`).replaceWith("<div class=\"requested-button\">Requested</div>");
                                            });
                                        }
                                    });
                                }
                            });

                            const modal = document.getElementById("myModal");
                            const span = document.getElementsByClassName("close")[0];
                            // When the user clicks on <span> (x), close the modal
                            span.onclick = function () {
                                modal.style.display = "none";
                            }
                            
                            // When the user clicks anywhere outside of the modal, close it
                            window.onclick = function (event) {
                                if (event.target == $('#myModal')) {
                                    modal.style.display = "none";
                                }
                            }

                            $(`#request-${schedule.schedule_id}`).hover(

                                (evt) => {
                                    evt.target.style.background = "black";
                                    evt.target.style.color = "white";

                                },

                                (evt) => {
                                    evt.target.style.removeProperty('background');
                                    evt.target.style.removeProperty('color');
                                }
                            );

                            $(`#request-${schedule.schedule_id}`).on('click', () => {

                                modal.style.display = "block";
                            });
                        }
                        else {
                            
                            $(`#schedule-item-${schedule.schedule_id}`).append(`<div></div><div class=\"requested-button\"></div>`);
                        }

                        if (status === "host" || status === "approved") {
                            
                            $.get('/profile', (user) => {

                                if (user === "None") {

                                    $('#homepage-display').append("<div class\"grid-schedule-post-box\" id=\"schedule-post-box\"></div>");
                                    $('#schedule-post-box').append("<div class=\"error-page\" id=\"error-page\">Sign in to post/view messages for this schedule.</div>");
                                }
                                else {

                                    $('#display-schedules').append("<button type=\"button\" class=\"collapsible\">See all approved users</button>" +
                                        "<div class=\"content-approved-users\"></div>");
                                    $('.content-approved-users').append('<div class=\"grid-users-list\"></div>');
                                    
                                    $.get(`/get-schedule-users/${schedule.schedule_id}`, (users) => {
                                        console.log(users);
                                        for(const user of users) {

                                            $('.grid-users-list').append(`<div class=\"post-avator\" id=\"post-avator-${user.user_id}\"></div>`)
                                            $(`#post-avator-${user.user_id}`).append(`<img class=\"avator-img\" id=\"avator-img-${user.user_id}\" src=\"${user.image_path}\"></img>`)
                                            $(`#post-avator-${user.user_id}`).append(`<div class=\"avator-name\" id=\"avator-name${user.user_id}\">${user.username}</div>`)
                                        }

                                        //insert users to content in a table format, hover over and delete (as host only)
















                                    });

                                    

                                    const element = document.getElementsByClassName("collapsible");

                                    for (let i = 0; i < element.length; i++) {
                                        element[i].addEventListener("click", function () {
                                            this.classList.toggle("active");
                                            let content = this.nextElementSibling;
                                            if (content.style.display === "block") {
                                                content.style.display = "none";
                                            } else {
                                                content.style.display = "block";
                                            }
                                        });
                                    }








                                    
                                    $('#homepage-display').append("<div class=\"grid-schedule-post-box\" id=\"schedule-post-box\"></div>");
                                    $('#schedule-post-box').append(`<div class=\"post-avator\" id=\"avatorbox-${user.user_id}\"></div>`);
                                    $(`#avatorbox-${user.user_id}`).append(`<img class=\"avator-img\" id=\"avatorimg-${user.user_id}\" src=\"${user.image_path}\"></img>`);
                                    $(`#avatorbox-${user.user_id}`).append(`<div class=\"avator-name\" id=\"avatorname-${user.user_id}\">${user.username}</div>`);

                                    $('#schedule-post-box').append("<div class=\"grid-post-box\" id=\"post-box\"></div>");
                                    $('#post-box').append(`<form action=\"/post/${schedule.schedule_id}\" method=\"POST\" id=\"post-form\">` +
                                        "<Label for=\"message\">Post Message:</Label>" +
                                        "<div class=\"grid-post-msg\">" +
                                        "<textarea name=\"message\" id=\"message\" rows=\"6\" cols=\"60\"></textarea>" +
                                        "<input type=\"submit\" value=\"submit\"></input>" +
                                        "</form></div>" +
                                        "<div class=\"flash-msg\" id=\"flash-msg\"></div>");
                                    $('#homepage-display').append("<div class=\"schedule-post-canvas\" id=\"schedule-post-canvas\"></div>");

                                    $('#post-form').on('submit', (evt) => {

                                        evt.preventDefault();

                                        if (document.querySelector('#message').value == '') {

                                            $('#flash-msg').html("Message cannot be blank.");
                                        }
                                        else {
                                            const formData = {
                                                "user_id": user.user_id,
                                                "schedule_id": schedule.schedule_id,
                                                "content": $('#message').val(),
                                            };

                                            $.post('/add-post', formData, (res) => {

                                                document.querySelector('#message').value = '';
                                                $('#flash-msg').html(res);
                                                $('#schedule-post-canvas').html("");

                                                $.get(`/get-posts/${schedule.schedule_id}`, (posts) => {

                                                    for (const post of posts) {

                                                        $('#schedule-post-canvas').append(`<div class=\"schedule-post-item\" id=\"scheduleposts-${post.post_id}\"></div>`);
                                                        $(`#scheduleposts-${post.post_id}`).append(`<div class=\"post-avator\" id=\"post-avatorbox-${post.post_id}\"></div>`);
                                                        $(`#post-avatorbox-${post.post_id}`).append(`<img class=\"avator-img\" id=\"avatorimg-${post.post_id}\" src=\"${post.image_path}\"></img>`);
                                                        $(`#post-avatorbox-${post.post_id}`).append(`<div class=\"avator-name\" id=\"avatorname-${post.post_id}\">${post.username}</div>`);

                                                        $(`#scheduleposts-${post.post_id}`).append(`<div class=\"grid-post-content\" id=\"postcontent-${post.post_id}\"></div>`);
                                                        $(`#postcontent-${post.post_id}`).append(`<div>${post.username} says:</div>`);
                                                        $(`#postcontent-${post.post_id}`).append(`<div class=\"postmsgbox\"><p>${post.content}</p></div>`);
                                                        $(`#postcontent-${post.post_id}`).append(`<div class=\"timestamp\">${post.time_stamp}</div>`);
                                                    }
                                                });
                                            })
                                        }
                                    });

                                    $.get(`/get-posts/${schedule.schedule_id}`, (posts) => {

                                        for (const post of posts) {

                                            $('#schedule-post-canvas').append(`<div class=\"schedule-post-item\" id=\"scheduleposts-${post.post_id}\"></div>`);
                                            $(`#scheduleposts-${post.post_id}`).append(`<div class=\"post-avator\" id=\"post-avatorbox-${post.post_id}\"></div>`);
                                            $(`#post-avatorbox-${post.post_id}`).append(`<img class=\"avator-img\" id=\"avatorimg-${post.post_id}\" src=\"${post.image_path}\"></img>`);
                                            $(`#post-avatorbox-${post.post_id}`).append(`<div class=\"avator-name\" id=\"avatorname-${post.post_id}\">${post.username}</div>`);

                                            $(`#scheduleposts-${post.post_id}`).append(`<div class=\"grid-post-content\" id=\"postcontent-${post.post_id}\"></div>`);
                                            $(`#postcontent-${post.post_id}`).append(`<div>${post.username} says:</div>`);
                                            $(`#postcontent-${post.post_id}`).append(`<div class=\"postmsgbox\"><p>${post.content}</p></div>`);
                                            $(`#postcontent-${post.post_id}`).append(`<div class=\"timestamp\">${post.time_stamp}</div>`);
                                        }
                                    });
                                }
                            })
                        }

                        else {
                            $('#homepage-display').append("<div class\"grid-schedule-post-box\" id=\"schedule-post-box\"></div>");
                            $('#schedule-post-box').append("<div class=\"error-page\" id=\"error-page\">You must be approved by the host to view/post messages.</div>");
                        }
                    });

                    break;
                }
                else {

                    $('#homepage-display').html(`<div class=\"error-page\" id=\"error-page\">Error: Cannot Find Schedule ID: ${evt.target.id.slice(9)}</div>`);
                }
            }  
        });
    });   
});

$('#all-games').on('click', () => {

    $('#homepage-display').html("<div class=\"subheader\" id=\"subheader\">All Games</div>");
    $('#homepage-display').append("<div class=\"grid-display-games\" id=\"display-games\"></div>");

    $.get('/get-games', (games) => {
        for (const game of games) {

            name = game.name.charAt(0).toUpperCase() + game.name.slice(1);
            $('#display-games').append(`<div class=\"grid-display-game-item\" id=\"display-game-item-${game.game_id}\"></div>`);
            $(`#display-game-item-${game.game_id}`).append(`<img class=\"display-game-item-img\" id=\"display-game-item-img-${game.game_id}\" src=\"${game.image_path}\"></div>` +
                `<div class=\"display-game-item-name\" id=\"display-game-item-name-${game.game_id}\"></div>`);
            $(`#display-game-item-name-${game.game_id}`).append(`${game.name}`);
        }

        $('.grid-display-game-item').hover(
            
            (evt) => {
                evt.target.style.borderWidth = "5px";
            },

            (evt) => {
                evt.target.style.borderWidth = "1px";
            }
        );

        $('.grid-display-game-item').on('click', (evt) => {
            
            const game_id = evt.target.id.slice(-1);










        });







    });









});

function get_userdetails_html(user) {

    return (
        `<div class="profile-user-item">User ID:</div>` +
        `<div class="profile-user-item">${user.user_id}</div>` +
        `<div class="profile-user-item">Username:</div>` +
        `<div class="profile-user-item">${user.username}</div>` +
        `<div class="profile-user-item">First Name:</div>` +
        `<div class="profile-user-item">${user.firstname}</div>` +
        `<div class="profile-user-item">Last Name:</div>` +
        `<div class="profile-user-item">${user.lastname}</div>` +
        `<div class="profile-user-item">Email:</div>` +
        `<div class="profile-user-item">${user.email}</div>` +
        `<div class="profile-user-item">Password:</div>` +
        `<div class="profile-user-item">${user.password}</div>`)
}

function get_userschedule_html(schedule) {
    
    return (
        `<div class=\"profile-schedules-item-text\">Host Username:</div>` +
        `<div class=\"profile-schedules-item-text\">${schedule['host_username']}</div>` +
        `<div class=\"profile-schedules-item-text\">Game ID:</div>` +
        `<div class=\"profile-schedules-item-text\">${schedule['game_id']}</div>` +
        `<div class=\"profile-schedules-item-text\">Game Name:</div>` +
        `<div class=\"profile-schedules-item-text\">${schedule['game_name']}</div>` +
        `<div class=\"profile-schedules-item-text\">Date/Time:</div>` +
        `<div class=\"profile-schedules-item-text\">${schedule['datetime']}</div>` +
        `<div class=\"profile-schedules-item-text\">Timezone:</div>` +
        `<div class=\"profile-schedules-item-text\">${schedule['timezone']}</div>` +
        `<div class=\"profile-schedules-item-text\">Plaform:</div>` +
        `<div class=\"profile-schedules-item-text\">${schedule['platform']}</div>` +
        `<div class=\"profile-schedules-item-text\">Max User:</div>` +
        `<div class=\"profile-schedules-item-text\">${schedule['max_user']}</div>` +
        `<div class=\"profile-schedules-item-text\">Max Team:</div>` +
        `<div class=\"profile-schedules-item-text\">${schedule['max_team']}</div>` +
        `<div class=\"profile-schedules-item-text\">Description:</div>` +
        `<div class=\"profile-schedules-item-text\">${schedule['description']}</div>`)
}

function get_userrequest_html(request) {
    
    return (
        `<div class=\"profile-schedules-item-text\">Game ID:</div>` +
        `<div class=\"profile-schedules-item-text\">${request['game_id']}</div>` +
        `<div class=\"profile-schedules-item-text\">Game Name:</div>` +
        `<div class=\"profile-schedules-item-text\">${request['game_name']}</div>` +
        `<div class=\"profile-schedules-item-text\">Schedule ID:</div>` +
        `<div class=\"profile-schedules-item-text\">${request['schedule_id']}</div>` +
        `<div class=\"profile-schedules-item-text\">Schedule Date/Time:</div>` +
        `<div class=\"profile-schedules-item-text\">${request['schedule_datetime']}</div>` +
        `<div class=\"profile-schedules-item-text\">Schedule Timezone:</div>` +
        `<div class=\"profile-schedules-item-text\">${request['schedule_timezone']}</div>` +
        `<div class=\"profile-schedules-item-text\">Request Message:</div>` +
        `<div class=\"profile-schedules-item-text\">${request['content']}</div>`+
        `<div class=\"profile-schedules-item-text\">Time Stamp:</div>` +
        `<div class=\"profile-schedules-item-text\">${request['time_stamp']}</div>`)
}

function get_userpost_html(post) {

    return (
        `<div class=\"profile-schedules-item-text\">Schedule ID:</div>` +
        `<div class=\"profile-schedules-item-text\">${post['schedule_id']}</div>` +
        `<div class=\"profile-schedules-item-text\">Time Stamp:</div>` +
        `<div class=\"profile-schedules-item-text\">${post['time_stamp']}</div>` +
        `<div class=\"profile-schedules-item-text\">Post Content:</div>` +
        `<div class=\"profile-schedules-item-text\">${post['content']}</div>`)
}

$('#my-profile').on('click', () => {
    
    $.get('/profile', (res) => {

        if(res == "None") {
            $('#homepage-display').html("<div class=\"error-page\" id=\"error-page\">Error: User Not Found</div>");
        }
        else {
            $('#homepage-display').html("<div class=\"grid-profile\" id=\"profile\"></div>");
            $('#profile').append("<div class=\"grid-profile-menu\" id=\"profile-menu\"></div>");
            $('#profile-menu').append("<div class=\"grid-profile-item\" id=\"profile-menu-user\">Account Details</div>" +
                "<div class=\"grid-profile-item\" id=\"profile-menu-schedules\">My Schedules</div>" +
                "<div class=\"grid-profile-item\" id=\"profile-menu-requests\">Pending Requests</div>" +
                "<div class=\"grid-profile-item\" id=\"profile-menu-posts\">Post History</div>");
            $('#profile').append("<div class=\"grid-profile-display\" id=\"profile-display\"></div>");
            $('#profile-display').append("<div class=\"profile-subheader\">Account Details</div>");
            $('#profile-display').append(`<img class=\"avator-img\" src=\"${res.image_path}\"></img>`);
            $('#profile-display').append("<div class=\"grid-profile-user\" id=\"profile-user\"></div>");
            $('#profile-user').append(get_userdetails_html(res));

            $('.grid-profile-item').hover(

                (evt) => {
                    evt.target.style.background = "black";
                    evt.target.style.color = "white";

                },

                (evt) => {
                    evt.target.style.removeProperty('background');
                    evt.target.style.removeProperty('color');
                }
            );

            $('#profile-menu-user').on('click', () => {
                
                $('#profile-display').html("<div class=\"profile-subheader\">Account Details</div>");
                $('#profile-display').append(`<img class=\"avator-img\" src=\"${res.image_path}\"></img>`);
                $('#profile-display').append(`<div></div>`);
                $('#profile-display').append("<div class=\"grid-profile-user\" id=\"profile-user\"></div>");
                $('#profile-user').append(get_userdetails_html(res));
            });

            $('#profile-menu-schedules').on('click', () => {

                $.get('/user-schedules', (schedules) => {
                    
                    $('#profile-display').html("<div class=\"profile-subheader\">My Schedules</div>");
                    $('#profile-display').append("<div class=\"grid-profile-schedules\" id=\"profile-schedules\"></div>");

                    $('#profile-schedules').append("<div class=\"profile-schedules-header\" id=\"profile-schedules-header\">Created</div>");
                    for(const schedule of schedules) {

                        if(schedule["type"] === "host") {
                            $('#profile-schedules').append(`<div class=\"grid-profile-schedule-item\" id=\"profile-schedule-${schedule["schedule_id"]}\"></div>`);
                            $(`#profile-schedule-${schedule["schedule_id"]}`).append(get_userschedule_html(schedule));
                        }
                    }

                    $('#profile-schedules').append("<div class=\"profile-schedules-header\" id=\"profile-schedules-header\">Joined</div>");
                    for (const schedule of schedules) {

                        if (schedule["type"] === "user") { 
                            
                            $('#profile-schedules').append(`<div class=\"grid-profile-schedule-item\" id=\"profile-schedule-${schedule["schedule_id"]}\"></div>`);
                            $(`#profile-schedule-${schedule["schedule_id"]}`).append(get_userschedule_html(schedule));
                        }
                    }
                });
            });

            $('#profile-menu-requests').on('click', () => {

                $.get('/user-requests', (requests) => {

                    $('#profile-display').html("<div class=\"profile-subheader\">Pending Requests</div>");
                    $('#profile-display').append("<div class=\"grid-profile-schedules\" id=\"profile-requests\"></div>");

                    $('#profile-requests').append("<div class=\"profile-schedules-header\" id=\"profile-requests-header\">Sent</div>");
                    for (const request of requests) {
                        
                        if (request["type"] === "sent") {
                            $('#profile-requests').append(`<div class=\"grid-profile-schedule-item\" id=\"profile-request-${request["request_id"]}\"></div>`);
                            $(`#profile-request-${request["request_id"]}`).append(get_userrequest_html(request));
                        }
                    }

                    $('#profile-requests').append("<div class=\"profile-schedules-header\" id=\"profile-requests-header\">Received</div>");
                    for (const request of requests) {

                        if (request["type"] === "received") {
                            $('#profile-requests').append(`<div class=\"grid-profile-schedule-item\" id=\"profile-request-${request["request_id"]}\"></div>`);
                            $(`#profile-request-${request["request_id"]}`).append(get_userrequest_html(request));
                        }
                    }
                });
            });

            $('#profile-menu-posts').on('click', () => {

                $.get('/user-posts', (posts) => {

                    $('#profile-display').html("<div class=\"profile-subheader\">Post Hisory</div>");
                    $('#profile-display').append("<div class=\"grid-profile-schedules\" id=\"profile-posts\"></div>")
                    

                    $('#profile-posts').append("<div class=\"profile-schedules-header\" id=\"profile-requests-header\"></div>");
                    for (const post of posts) {

                        $('#profile-posts').append(`<div class=\"grid-profile-schedule-item\" id=\"profile-post-${post["post_id"]}\"></div>`);
                        $(`#profile-post-${post["post_id"]}`).append(get_userpost_html(post));
                    }
                });
            });
        }
    });
});

function onKeyUp_searchGames() {

    const searchData = $('#search-game').val();

    $.get('/game-info.json', {'search':searchData}, (result) => {
        
        let artwork_url = '';
        const results = JSON.parse(result);
        $('#homepage-display').html(`<div class=\"display-search-text\" id=\"display-search-text\">Showing ${results.length} results:</div>`);
        $('#homepage-display').append("<div class=\"grid-display-search-results\" id=\"display-search-results\"></div>");
        
        for (let i = 0; i < results.length; i++) {

            let date = '';

            if (results[i].first_release_date) {

                const timestamp = new Date(results[i].first_release_date);
                date = timestamp.getDate() + "/" + (`${timestamp.getMonth()}` + 1).toString() + "/" + timestamp.getFullYear();
            }
            else {

                date = "NA";
            }

            if(results[i]['artworks']) {
                artwork_url = results[i]['artworks'][0]['url'];
            }
            else {
                artwork_url = "/static/img/image-placeholder.jpg";
            }
            
            $('#display-search-results').append(`
                <div class=\"search-result-item\" id=\"item-${results[i].name}\">
                    <img class=\"search-result-item-img\" src=${artwork_url}></img>
                    <div class=\"search-result-item-content\">
                        Name: ${results[i].name}
                        <div>Release Date: ${date}</div>
                        <div class=\"platforms\" id=\"platforms-${results[i].id}\">Plaform(s): </div>
                    </div>
                    <div>
                        <div class=\"select-game\" id=\"select-game\">Select</div>
                    </div
                </div>`            
            );

            if (!results[i].platforms) { 
                results[i].platforms = new Array();
            }

            for(let j = 0; j < results[i].platforms.length; j++) {
                
                if(j == results[i].platforms.length-1) {
                    $(`#platforms-${results[i].id}`).append(`${results[i].platforms[j].name}`);
                }
                else {
                    $(`#platforms-${results[i].id}`).append(`${results[i].platforms[j].name}, `);

                }
            }

            $('.select-game').hover(

                (evt) => {
                    evt.target.style.background = "lightcyan";
                },

                (evt) => {
                    evt.target.style.removeProperty('background');
                }
            );
        }
    });
}






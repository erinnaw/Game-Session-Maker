"use-strict";

$('.adminbutton').on('click', (evt) => {

    $.get(`/admin/${evt.target.id}`, (data) => {

        if (evt.target.id === "users") {

            $('#homepage-display').html('<div class=\"subheader\">All Users</div>');
            $('#homepage-display').append('<div class=\"grid-admin-display\"></div>');

            for (let i = 0; i < data.length; i++) {

                $('.grid-admin-display').append(`<div class=\"admin-display-item\" id=\"admin-display-item-${i}\"></div>`);
                $(`#admin-display-item-${i}`).append(`User ID: ${data[i].user_id} |
                                                Username: ${data[i].username} |
                                                First Name: ${data[i].firstname} |
                                                Last Name: ${data[i].lastname} |
                                                Email: ${data[i].email} |
                                                Password: ${data[i].password} |
                                                image_path: ${data[i].image_path}`);

            }
        }
        else if (evt.target.id === "games") {

            $('#homepage-display').html('<div class=\"subheader\">All Games</div>');
            $('#homepage-display').append('<div class=\"grid-admin-display\"></div>');

            for (let i = 0; i < data.length; i++) {

                $('.grid-admin-display').append(`<div class=\"admin-display-item\" id=\"admin-display-item-${i}\"></div>`);
                $(`#admin-display-item-${i}`).append(`Game ID: ${data[i].game_id} |
                                                Name: ${data[i].name} |
                                                Image Path: ${data[i].image_path}`);
            }
        }
        else if (evt.target.id === "schedules") {
            
            $('#homepage-display').html('<div class=\"subheader\">All Schedules</div>');
            $('#homepage-display').append('<div class=\"grid-admin-display\"></div>');

            for (let i = 0; i < data.length; i++) {

                $('.grid-admin-display').append(`<div class=\"admin-display-item\" id=\"admin-display-item-${i}\"></div>`);
                $(`#admin-display-item-${i}`).append(`Schedule ID: ${data[i].schedule_id} |
                                                User ID: ${data[i].user_id} |
                                                Game ID: ${data[i].game_id} |
                                                isArchived: ${data[i].isArchived}`);
            }
        }
        else if (evt.target.id === "requests") {

            $('#homepage-display').html('<div class=\"subheader\">All Requests</div>');
            $('#homepage-display').append('<div class=\"grid-admin-display\"></div>');

            for (let i = 0; i < data.length; i++) {

                $('.grid-admin-display').append(`<div class=\"admin-display-item\" id=\"admin-display-item-${i}\"></div>`);
                $(`#admin-display-item-${i}`).append(`Request ID: ${data[i].request_id} |
                                                User ID: ${data[i].user_id} |
                                                Game ID: ${data[i].game_id} |
                                                Schedule ID: ${data[i].schedule_id}`);
            }
        }
        else if (evt.target.id === "posts") {

            $('#homepage-display').html('<div class=\"subheader\">All Posts</div>');
            $('#homepage-display').append('<div class=\"grid-admin-display\"></div>');

            for (let i = 0; i < data.length; i++) {

                $('.grid-admin-display').append(`<div class=\"admin-display-item\" id=\"admin-display-item-${i}\"></div>`);
                $(`#admin-display-item-${i}`).append(`Post ID: ${data[i].post_id} |
                                                Schedule ID: ${data[i].schedule_id} |
                                                User ID: ${data[i].user_id}`);
            }
        }
        else if (evt.target.id === "schedule-users") {

            $('#homepage-display').html('<div class=\"subheader\">All Schedule_Users</div>');
            $('#homepage-display').append('<div class=\"grid-admin-display\"></div>');

            for (let i = 0; i < data.length; i++) {

                $('.grid-admin-display').append(`<div class=\"admin-display-item\" id=\"admin-display-item-${i}\"></div>`);
                $(`#admin-display-item-${i}`).append(`Schedule Users ID: ${data[i].schedule_users_id} |
                                                Schedule ID: ${data[i].schedule_id} |
                                                User ID: ${data[i].user_id}`);
            }
        }
    });
});
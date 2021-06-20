"use-strict";

//tracks page number for all-schedules pages
const MAX_PAGE_NUM_PER_SET = 10;
let curr_schedule_search_page_num = 1;
let curr_schedule_search_page_set = 1;

//tracks page number for posts in schedule page
let curr_post_page_num = 1;
let curr_post_page_set = 1;

let searchFlag = new Boolean(false);
let searchHandler;
const search_timer = 800;

let schedule_search_Flag = new Boolean(false);
let schedule_search_Handler;
const schedule_search_timer = 500;

let game_search_Flag = new Boolean(false);
let game_search_Handler;
const game_search_timer = 500;

let prev_formData;
let back_button_flag = new Boolean(false);
let searchParams;

let back_state;

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

    $('#all-games').trigger('click');
});

const isAdvancedUpload = function () {
    const div = document.createElement('div');
    return (('draggable' in div) || ('ondragstart' in div && 'ondrop' in div)) && 'FormData' in window && 'FileReader' in window;
}();

$('#create-account').on('click', () => {

    $('#homepage-display').html("<div class=\"subheader\" id=\"subheader\">Create Account</div>");
    $('#homepage-display').append("<form class=\"registration-form\" id=\"registration-form\" action=\"/create-user\" method=\"POST\"></form>");

    $('#registration-form').append("<div class=\"avator-upload-form\" id=\"avator-upload-form\">");
    $('#avator-upload-form').append("<img class=\"avator-img-profile-upload\" id=\"avator-img\" src=\"/static/img/avator-placeholder.jpg\"></img>");
    $('#avator-upload-form').append("<div class=\"drop-area\" id=\"drop-area\"></div>");
    $('#drop-area').append("<input accept=\"image/*\" type=\"file\" class=\"file-box\" name=\"files[]\" id=\"file\" data-multiple-caption=\"{count} files selected\" multiple></input>" +
        "<br><label for=\"file\"><strong>Select an image</strong><br>" +
        "<span class=\"dragdrop-box\">or drag and drop</span></div>");
    $('#registration-form').append("<div class=\"registration-form-spacing\"></div>");

    $('#registration-form').append("<div class=\"grid-registration\" id=\"registration\"></div>");
    $('#registration').append(
        "<Label for=\"username\">Username*</Label>"+
        "<input type =\"text\" name=\"username\" id=\"username\">"+
        "<Label for=\"fname\">First Name</Label>"+
        "<input type =\"text\" name=\"fname\" id=\"fname\">"+
        "<Label for=\"lname\">Last Name</Label>"+
        "<input type =\"text\" name=\"lname\" id=\"lname\">"+
        "<Label for=\"email\">Email*</Label>" +
        "<input type =\"email\" name=\"email\" id=\"email\">" +
        "<Label for= \"password\">Password*</Label>" +
        "<input type=\"password\" name=\"password\" id=\"password\">" +
        "<div></div><div><input type=\"checkbox\" onclick=\"showPassword()\"></input>Show Password</div>" +
        "<div></div><input type=\"submit\" value=\"Submit\">" +
        "<div></div>* required fields" +
        "<div class=\"flash-msg\" id=\"flash-msg\"></div>");

    if (isAdvancedUpload) {

        $('#avator-upload-form').addClass('has-advanced-upload');
        let droppedFiles = false;
        const $form = $('#avator-upload-form');
        const $label = $form.find('label');

        const showFiles = function (files) {

            $label.text(files.length > 1 ? ($('#drop-area').attr('data-multiple-caption') || '').replace('{count}', files.length) : files[0].name);
        }

        $('#avator-upload-form').on('submit drag dragstart dragend dragover dragenter dragleave drop', function (evt) {

            evt.preventDefault();
            evt.stopPropagation();
        })
        .on('dragover dragenter', function () {

            $('#avator-upload-form').addClass('is-dragover');
        })
        .on('dragleave dragend drop', function () {

            $('#avator-upload-form').removeClass('is-dragover');
        })
        .on('drop', function (evt) {

            droppedFiles = evt.originalEvent.dataTransfer.files;
            showFiles(droppedFiles);

            if (droppedFiles) {
                $('#avator-img').attr("src", URL.createObjectURL(droppedFiles[0]));
            }
        })
        .on('change', () => {

            const [file_] = file.files;
            if (file_) {
                $('#avator-img').attr("src", URL.createObjectURL(file_));
            }
        });
    }

    $('#registration-form').on('submit', (evt) => {
        
        evt.preventDefault();
        const formData = {
            "username": $('#username').val(),
            "fname": $('#fname').val(),
            "lname": $('#lname').val(),
            "email": $('#email').val(),
            "password": $('#password').val(),
            "image_path": $('#avator-img').attr('src')
        };

        $.post('/add-user', formData, (res) => {

            if(!res.status) {

                $('#snackbar').html(res.flash);
                document.getElementById("snackbar").className = "show";
                setTimeout(function () { document.getElementById("snackbar").className = document.getElementById("snackbar").className.replace("show", ""); }, 3000);
                $('#all-games').trigger('click');
            }
            else {

                $('#flash-msg').html(res.flash);
            }
        })
    });
});

function showPassword() {

    if (document.getElementById("password").type === "password") {

        document.getElementById("password").type = "text";
    }
    else {

        document.getElementById("password").type = "password";
    }
}

$('#log-in').on('click', () => {

    $('#homepage-display').html("<div class=\"subheader\" id=\"subheader\">Log In</div>");
    $('#homepage-display').append("<form class = \"login-form\" id = \"login-form\" action = \"/login\" method = \"POST\"></form>");
    $('#login-form').append("<div class=\"grid-login\" id=\"login\"></div>");
    $('#login').append(
        "<Label for=\"email\">Email</Label>" +
        "<input type =\"email\" name=\"email\" id=\"email\">" +
        "<Label for= \"password\">Password</Label>" +
        "<input type=\"password\" name=\"password\" id=\"password\">" +
        "<div></div><div><input type=\"checkbox\" onclick=\"showPassword()\"></input>Show Password</div>" +
        "<div></div><input type=\"submit\" value=\"Submit\">" +
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

$('#create-schedule').on('click', createSchedule_by_game_id);

$('#all-schedules').on('click', () => {

    $('#homepage-display').html("<div class=\"subheader\" id=\"subheader\">All Schedules</div>");
    $('#homepage-display').append("<form class=\"display-search-schedule-bar\" method=\"GET\" id=\"search-schedule-bar\"></form>");
    $('#search-schedule-bar').append("<div class=\"search-schedule-item\">Show</div><select name=\"limit_size\" id=\"limit_size\" onchange=\"onKeyUp_searchSchedules()\"></select>");
    $('#limit_size').append("<option value=\"10\">10</option>" +
                                    "<option value=\"20\" selected>20</option>" +
                                    "<option value=\"50\">50</option>" +
                                    "<option value=\"100\">100</option>");
    $('#search-schedule-bar').append("<div class=\"search-schedule-item\">Host Username</div><input onkeyup=\"onKeyUp_searchSchedules()\" onkeydown=\"return (event.keyCode != 13);\"/ type=\"text\" name=\"username\" id=\"username\"></input>");
    $('#search-schedule-bar').append("<div class=\"search-schedule-item\">Game Name</div><input onkeyup=\"onKeyUp_searchSchedules()\" onkeydown=\"return (event.keyCode != 13);\"/ type=\"text\" name=\"game_name\" id=\"game_name\"></input>");
    $('#search-schedule-bar').append("<div class=\"search-schedule-item\">Date</div><input onchange=\"onKeyUp_searchSchedules()\" type=\"date\" name=\"date\" id=\"date\"></input>");
    $('#search-schedule-bar').append("<div class=\"search-schedule-item\">Time</div><input onchange=\"onKeyUp_searchSchedules()\" type=\"time\" name=\"time\" id=\"time\"></input>");
    $('#homepage-display').append("<div class=\"grid-display-schedules\" id=\"display-schedules\"></div>");
    $('#homepage-display').append("<div class=\"display-page-num\" id=\"display-page-num\"></div>");

    if (back_button_flag == true) {

        searchParams = new URLSearchParams(prev_formData);
        let arr = new Array();

        for (const value of searchParams.values()) {

            arr.push(value);
        }

        $('#limit_size').val(arr[0]);
        $('#username').val(arr[1]);
        $('#game_name').val(arr[2]);
        $('#date').val(arr[3]);
        $('#time').val(arr[4]);
        back_button_flag = false;
    }

    curr_schedule_search_page_num = 1;
    curr_schedule_search_page_set = 1;
    get_schedules();
});

function onKeyUp_searchSchedules() {

    curr_schedule_search_page_num = 1;
    curr_schedule_search_page_set = 1;

    if (schedule_search_Flag) {

        clearTimeout(schedule_search_Handler);
        schedule_search_Handler = window.setTimeout(get_schedules, schedule_search_timer);
        game_search_Flag = false;
    }
    else {

        schedule_search_Flag = true;
        schedule_search_Handler = window.setTimeout(get_schedules, schedule_search_timer);
    }
}

function get_schedules() {

    const formData = $('#search-schedule-bar').serialize() + "&offset_page=" + (curr_schedule_search_page_num - 1);
    prev_formData = formData;

    $('#display-schedules').html('');

    $.get('/get-schedules-active', formData, (schedules) => {

        for (const schedule of schedules[0]) {

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
            $(`#schedule-item-${schedule.schedule_id}`).append(`<div></div><div class=\"view-schedule-button\" id=\"schedule-${schedule.schedule_id}\">view</div>`);
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

            back_state = "";
            back_button_flag = true;
            view_schedule(evt.target.id.slice(9));
        });

        //generate paginatiom
        $('#display-page-num').html("<div class=\"grid-num-pages\" id=\"num-pages\"></div>")
        const MAX_ITEM_PER_PAGE = $('#limit_size').val();
        const total_pages = Math.ceil(schedules[1].query_count/MAX_ITEM_PER_PAGE);
        const total_page_sets = Math.ceil(total_pages/MAX_PAGE_NUM_PER_SET);
        let num_pages = total_pages;

        if (total_pages > MAX_PAGE_NUM_PER_SET) {

            num_pages = MAX_PAGE_NUM_PER_SET;
        }
        
        //checks if last set of pages
        if (curr_schedule_search_page_set == total_page_sets) {

            num_pages = total_pages - (MAX_PAGE_NUM_PER_SET * (curr_schedule_search_page_set - 1));
        }

        if (curr_schedule_search_page_set != 1) {

            $('#num-pages').append(`<div class=\"triangle-left\" id=\"prev-page-set-${curr_schedule_search_page_set}\"></div>`);

            $(`#prev-page-set-${curr_schedule_search_page_set}`).on('click', () => {

                curr_schedule_search_page_set -= 1;
                curr_schedule_search_page_num = MAX_PAGE_NUM_PER_SET * (curr_schedule_search_page_set - 1) + 1;
                get_schedules();
            });
        }

        for (let i = 1; i <= num_pages; i++) {

            const offset = MAX_PAGE_NUM_PER_SET * (curr_schedule_search_page_set - 1);

            $('#num-pages').append(`<div class=\"page-num\" id=\"page-num-${offset + i}\">${offset + i}</div>`);

            $(`#page-num-${offset + i}`).on('click', () => {

                curr_schedule_search_page_num = offset + i;
                get_schedules();
            });

            if (curr_schedule_search_page_num === offset + i) {

                $(`#page-num-${offset + i}`).addClass("page-num-selected");
            }
            else {
                $(`#page-num-${offset + i}`).removeClass("page-num-selected");
            }
        }

        if (curr_schedule_search_page_set < total_page_sets) {
            
            $('#num-pages').append(`<div class=\"triangle-right\" id=\"next-page-set-${curr_schedule_search_page_set}\"></div>`);

            $(`#next-page-set-${curr_schedule_search_page_set}`).on('click', () => {
                
                curr_schedule_search_page_set += 1;
                curr_schedule_search_page_num = MAX_PAGE_NUM_PER_SET * (curr_schedule_search_page_set - 1) + 1;
                get_schedules();
            });
        }        
    });
}

function view_schedule(schedule_id) {

    curr_post_page_num = 1;
    curr_post_page_set = 1;

    $.get(`/get-schedule-by-id/${schedule_id}`, (schedule) => {

        $('#homepage-display').html(`<div class=\"subheader\" id=\"subheader\">Schedule ID: ${schedule.schedule_id}</div>`);
        $('#homepage-display').append(`<div class=\"back-bar\"><div class=\"back-button\" id=\"back-button\">Back</div></div>`);
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

        $('.back-button').on('click', () => {

            if (back_state === "created"){

                $('#my-profile').trigger('click');
            }
            else if(back_state === "joined") {

                $('#my-profile').trigger('click');
            }
            else if(back_state === "archived") {
            
                $('#my-profile').trigger('click');
            }
            else if(back_state === "sent") {

                $('#my-profile').trigger('click');
            }
            else if(back_state === "received") {

                $('#my-profile').trigger('click');
            }
            else if(back_state === "createaschedule") {

                back_state = "";
                $('#all-schedules').trigger('click');
            }
            else {

                back_button_flag = true;
                $('#all-schedules').trigger('click');
            }
        });

        $.get(`/get-schedule-user-status/${schedule.schedule_id}`, (status) => {

            if (status === "host") {

                $(`#schedule-item-${schedule.schedule_id}`).append(`<div></div><div class=\"view-requests-button\" id=\"view-requests-${schedule.schedule_id}\">Host</div>`);
            }
            else if (status === "requested") {

                $(`#schedule-item-${schedule.schedule_id}`).append(`<div></div><div class=\"requested-button\" id=\"requested-${schedule.schedule_id}\">Requested</div>`);
            }
            else if (status === "approved") {

                $(`#schedule-item-${schedule.schedule_id}`).append(`<div></div><div class=\"approved-button\" id=\"approved-${schedule.schedule_id}\">Approved</div>`);
            }
            else if (status === "not approved") {

                $(`#schedule-item-${schedule.schedule_id}`).append(`<div></div><div class=\"request-button\" id=\"request-${schedule.schedule_id}\">Request</div>`);
                $(`#schedule-item-${schedule.schedule_id}`).append("<div id=\"myModal\" class=\"modal\">" +
                    "<div class=\"modal-content\">" +
                    "<span class=\"close\">&times;</span>" +
                    "<div class=\"grid-request-form\" id=\"request-form\"></div>" +
                    "</div></div>")

                $.get('/profile', (user) => {

                    if (user === "None") {
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

                        if (status === "host") {

                            $('#display-schedules').append("<button type=\"button\" class=\"collapsible\" id=\"requests-button\">See all requests</button>" +
                                "<div class=\"content-approved-users\" id=\"content-requests\"></div>");

                            $('#requests-button').on('click', () => {

                                $('#content-requests').html(`<div class=\"grid-request-list\" id=\"display-requests\"></div>`);

                                $.get(`/get-requests/${schedule.schedule_id}`, (requests) => {

                                    if (requests.slice(0, 5) === "Error") {

                                        $(`#display-requests`).html(`<div class=\"error-page\" id=\"error-page\">${requests}</div>`);
                                    }
                                    else {

                                        for (const request of requests) {

                                            $(`#display-requests`).append(`<div class=\"grid-display-request-item\" id=\"request-item-${request.request_id}\"></div>`);
                                            $(`#request-item-${request.request_id}`).html(`<div class=\"post-avator\" id=\"post-avator-${request.user_id}\"></div>`);
                                            $(`#post-avator-${request.user_id}`).append(`<img class=\"avator-img\" id=\"avator-img-${request.user_id}\" src=\"${request.image_path}\"></img>`);
                                            $(`#post-avator-${request.user_id}`).append(`<div class=\"avator-name\" id=\"avator-name-${request.user_id}\">${request.username}</div>`);

                                            $(`#request-item-${request.request_id}`).append(`<div class=\"grid-request-content\" id=\"request-content-${request.request_id}\"></div>`);
                                            $(`#request-content-${request.request_id}`).append(`<div class=\"grid-request-header\" id=\"request-header-${request.request_id}\">Request Message</div>`);
                                            $(`#request-content-${request.request_id}`).append(`<div class=\"postmsgbox\">${request.content}</div>`);
                                            $(`#request-content-${request.request_id}`).append(`<div class=\"timestamp\" id=\"timestamp-request-${request.request_id}\">${request.time_stamp}</div>`);

                                            $(`#request-item-${request.request_id}`).append(`<div class=\"grid-approval\" id=\"approval-${request.request_id}\"></div>`);
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

                        $('#display-schedules').append("<button type=\"button\" class=\"collapsible\" id=\"approval-button\">See all approved users</button>" +
                            "<div class=\"content-approved-users\" id=\"content-approved\"></div>");

                        $('#approval-button').on('click', () => {

                            $.get(`/get-schedule-users/${schedule.schedule_id}`, (users) => {

                                $('#content-approved').html(`<div class=\"grid-users-list\" id=\"users-list\"></div>`);

                                for (const user of users) {

                                    if (status === "host") {

                                        $('#users-list').append(`<div class=\"post-avator-hover\" id=\"post-avator-hover-${user.user_id}\"></div>`);
                                        $(`#post-avator-hover-${user.user_id}`).html(`<img class=\"avator-img\" id=\"avator-img-${user.user_id}\" src=\"${user.image_path}\"></img>`);
                                        $(`#post-avator-hover-${user.user_id}`).append(`<div class=\"avator-name\" id=\"avator-name${user.user_id}\">${user.username}</div>`);
                                        $(`#post-avator-hover-${user.user_id}`).append(`<div class=\"kick-user\" id=\"kick-user-${user.user_id}\">Kick User</div>`);

                                        $(`#kick-user-${user.user_id}`).on('click', () => {

                                            $.post(`/remove-user-from-schedule/${schedule.schedule_id}/${user.user_id}`, (msg) => {

                                                $(`#post-avator-hover-${user.user_id}`).replaceWith(`<div class=\"kicked-user\" id=\"kicked-user-${user.user_id}\">${user.username} ${msg}</div>`);
                                                $(`#kick-user-${user.user_id}`).remove();
                                            });
                                        });
                                    }
                                    else {

                                        $('#users-list').append(`<div class=\"post-avator\" id=\"post-avator-${user.user_id}\"></div>`);
                                        $(`#post-avator-${user.user_id}`).html(`<img class=\"avator-img\" id=\"avator-img-${user.user_id}\" src=\"${user.image_path}\"></img>`);
                                        $(`#post-avator-${user.user_id}`).append(`<div class=\"avator-name\" id=\"avator-name${user.user_id}\">${user.username}</div>`);
                                    }
                                }
                            });
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
                        $('#homepage-display').append("<div class=\"grid-display-bar\" id=\"display-bar\"><div class=\"search-schedule-item\">Show</div><select name=\"max_posts\" id=\"max_posts\"></select></div>");
                        $('#max_posts').append("<option value=\"10\">10</option>" +
                            "<option value=\"20\" selected>20</option>" +
                            "<option value=\"50\">50</option>" +
                            "<option value=\"100\">100</option>");
                        $('#homepage-display').append("<div class=\"schedule-post-canvas\" id=\"schedule-post-canvas\"></div>");
                        $('#homepage-display').append("<div class=\"display-page-num\" id=\"display-page-num\"></div>");

                        $('#max_posts').on('change', () => {

                            get_scheduleposts(schedule.schedule_id);
                        });

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

                                    get_scheduleposts(schedule.schedule_id);
                                });
                            }
                        });

                        get_scheduleposts(schedule.schedule_id)
                    }
                });
            }
            else {
                $('#homepage-display').append("<div class\"grid-schedule-post-box\" id=\"schedule-post-box\"></div>");
                $('#schedule-post-box').append("<div class=\"error-page\" id=\"error-page\">You must be approved by the host to view/post messages.</div>");
            }
        });
    });
}

function get_scheduleposts(schedule_id) {

    $.get(`/get-posts/${schedule_id}`, { "limit_size": $('#max_posts').val(), "offset_page": curr_post_page_num - 1}, (posts) => {

        $('#schedule-post-canvas').html('');

        if (posts[0].length == 0) {

            $('#schedule-post-canvas').append("<div class=\"error-page\">No posts yet.</div>");
        }
        else {

            for (const post of posts[0]) {

                $('#schedule-post-canvas').append(`<div class=\"schedule-post-item\" id=\"scheduleposts-${post.post_id}\"></div>`);
                $(`#scheduleposts-${post.post_id}`).append(`<div class=\"post-avator\" id=\"post-avatorbox-${post.post_id}\"></div>`);
                $(`#post-avatorbox-${post.post_id}`).append(`<img class=\"avator-img\" id=\"avatorimg-${post.post_id}\" src=\"${post.image_path}\"></img>`);
                $(`#post-avatorbox-${post.post_id}`).append(`<div class=\"avator-name\" id=\"avatorname-${post.post_id}\">${post.username}</div>`);

                $(`#scheduleposts-${post.post_id}`).append(`<div class=\"grid-post-content\" id=\"postcontent-${post.post_id}\"></div>`);
                $(`#postcontent-${post.post_id}`).append(`<div>${post.username} says:</div>`);
                $(`#postcontent-${post.post_id}`).append(`<div class=\"postmsgbox\"><p>${post.content}</p></div>`);
                $(`#postcontent-${post.post_id}`).append(`<div class=\"timestamp\">${post.time_stamp}</div>`);
            }
        }

        //generate paginatiom
        $('#display-page-num').html("<div class=\"grid-num-pages\" id=\"num-pages-posts\"></div>")
        const MAX_ITEM_PER_PAGE = $('#max_posts').val();
        const total_pages = Math.ceil(posts[1].post_count / MAX_ITEM_PER_PAGE);
        const total_page_sets = Math.ceil(total_pages / MAX_PAGE_NUM_PER_SET);
        let num_pages = total_pages;

        if (total_pages > MAX_PAGE_NUM_PER_SET) {

            num_pages = MAX_PAGE_NUM_PER_SET;
        }

        //checks if last set of pages
        if (curr_schedule_search_page_set == total_page_sets) {

            num_pages = total_pages - (MAX_PAGE_NUM_PER_SET * (curr_post_page_set - 1));
        }

        if (curr_post_page_set != 1) {

            $('#num-pages-posts').append(`<div class=\"triangle-left\" id=\"prev-page-set-${curr_post_page_set}\"></div>`);

            $(`#prev-page-set-${curr_post_page_set}`).on('click', () => {

                curr_post_page_set -= 1;
                curr_post_page_num = MAX_PAGE_NUM_PER_SET * (curr_post_page_set - 1) + 1;
                get_scheduleposts(schedule_id);
            });
        }

        for (let i = 1; i <= num_pages; i++) {

            const offset = MAX_PAGE_NUM_PER_SET * (curr_post_page_set - 1);

            $('#num-pages-posts').append(`<div class=\"page-num\" id=\"page-num-${offset + i}\">${offset + i}</div>`);

            $(`#page-num-${offset + i}`).on('click', () => {

                curr_post_page_num = offset + i;
                get_scheduleposts(schedule_id);
            });

            if (curr_post_page_num === offset + i) {

                $(`#page-num-${offset + i}`).addClass("page-num-selected");
            }
            else {
                $(`#page-num-${offset + i}`).removeClass("page-num-selected");
            }
        }

        if (curr_post_page_set < total_page_sets) {

            $('#num-pages-posts').append(`<div class=\"triangle-right\" id=\"next-page-set-${curr_post_page_set}\"></div>`);

            $(`#next-page-set-${curr_post_page_set}`).on('click', () => {

                curr_post_page_set += 1;
                curr_post_page_num = MAX_PAGE_NUM_PER_SET * (curr_post_page_set - 1) + 1;
                get_scheduleposts(schedule_id);
            });
        }
    });
}

function get_userdetails_html(user) {

    return (
        `<div class="profile-user-item">User ID:</div>` +
        `<div class="profile-user-item">${user.user_id}</div>` +
        `<div class="profile-user-item">Username:</div>` +
        `<div class="profile-user-item">${user.username}</div>` +
        `<div class="profile-user-item">First Name:</div>` +
        `<div class="profile-user-item" id=\"edit-firstname\">${user.firstname}</div>` +
        `<div class="profile-user-item">Last Name:</div>` +
        `<div class="profile-user-item" id=\"edit-lastname\">${user.lastname}</div>` +
        `<div class="profile-user-item">Email:</div>` +
        `<div class="profile-user-item" id=\"edit-email\">${user.email}</div>` +
        `<div class="profile-user-item">Password:</div>` +
        `<div class="profile-user-item" id=\"edit-password\">${user.password}</div>`)
}

function get_userschedule_html(schedule) {

    let str = '';

    if (schedule['isArchived']) {

        str = `<div class=\"profile-schedules-item-text\"><span class=\"status-archived\">Archived</span></div>`;
    }
        
    else {

        str = `<div class=\"profile-schedules-item-text\"><span class=\"status-not-archived\">Active</span></div>`;
    }   
    
    return (
        `<div class=\"profile-schedules-item-text\">Schedule ID:</div>` +
        `<div class=\"profile-schedules-item-text\">${schedule['schedule_id']}</div>` +
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
        `<div class=\"profile-schedules-item-text\">${schedule['description']}</div>` +
        `<div class=\"profile-schedules-item-text\">Status:</div>` + str)
}

function get_userrequest_html(request) {
    
    return (
        `<div class=\"profile-schedules-item-text\">Username:</div>` +
        `<div class=\"profile-schedules-item-text\">${request['username']}</div>` +
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

function createSchedule_by_game_id(game_id = 1) {

    $.get('/profile', (user) => {
        if (user === "None") {
            $('#homepage-display').html("<div class=\"error-page\" id=\"error-page\">You must be signed in to create a schedule.</div>");
        }
        else {
            $('#homepage-display').html("<div class=\"subheader\" id=\"subheader\">Create a Schedule</div>");
            $('#homepage-display').append("<form class=\"schedule-form\" id=\"schedule-form\" action=\"/create-schedule\" method=\"POST\"></form>");
            $('#schedule-form').append("<div class=\"grid-create-schedule-form\" id=\"create-schedule-form\"></div>");
            $('#create-schedule-form').append(`<Label for=\"game\">Game*</Label><select name=\"game\" id=\"gameselect\"></select>`);
            
            $.get('/get-all-games', (games) => {
                for (const game of games) {

                    name = game.name.charAt(0).toUpperCase() + game.name.slice(1);
                    $('#gameselect').append(`<option value=${game.game_id}>${name}</option>`);
                }

                $(`#gameselect option[value=\"${game_id}\"]`).attr("selected", true);
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

                    if (data.status === "fail") {
                        $('#flash-msg').html(data.flash);
                    }
                    else {
                        $('#snackbar').html(`${data.flash}`);
                        document.getElementById("snackbar").className = "show";
                        setTimeout(function () { document.getElementById("snackbar").className = document.getElementById("snackbar").className.replace("show", ""); }, 3000);
                        back_state = "createaschedule";
                        view_schedule(data.schedule_id);
                    }
                });
            });
        }
    });
}

function createSchedule_by_game_name(game_name, image_path) {

    $.get('/profile', (user) => {

        if (user === "None") {

            $('#homepage-display').html("<div class=\"error-page\" id=\"error-page\">You must be signed in to create a schedule.</div>");
        }
        else {
           
            $('#homepage-display').html("<div class=\"subheader\" id=\"subheader\">Create a Schedule</div>");
            $('#homepage-display').append("<form class=\"schedule-form\" id=\"schedule-form\" action=\"/create-schedule\" method=\"POST\"></form>");
            $('#schedule-form').append("<div class=\"grid-create-schedule-form\" id=\"create-schedule-form\"></div>");
            $('#create-schedule-form').append(`<Label for=\"game\">Game*</Label><input type=\"hidden\" name=\"game\" id=\"gameselect\" value=\"${game_name}\"></input><div>${game_name}</div>`);
            $('#create-schedule-form').append(`<input type=\"hidden\" name=\"image_path\" id=\"image_path\" value=\"${image_path}\"></input>`);

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
                
                $.post('/create-schedule-by-search-game', formData, (data) => {

                    if (data.status === "fail") {

                        $('#flash-msg').html(data.flash);
                    }
                    else {

                        $('#snackbar').html(`${data.flash}`);
                        document.getElementById("snackbar").className = "show";
                        setTimeout(function () { document.getElementById("snackbar").className = document.getElementById("snackbar").className.replace("show", ""); }, 3000);
                        back_state = "createaschedule";
                        view_schedule(data.schedule_id);
                    }
                });
            });
        }
    });
}

function openPage(pageName, elmnt, color) {
    // Hide all elements with class="tabcontent" by default */
    const tabcontent = document.getElementsByClassName("tabcontent");
    for (let i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    // Remove the background color of all tablinks/buttons
    const tablinks = document.getElementsByClassName("tablink");
    for (let i = 0; i < tablinks.length; i++) {
        tablinks[i].style.backgroundColor = "";
    }

    // Show the specific tab content
    document.getElementById(pageName).style.display = "block";

    // Add the specific color to the button used to open the tab content
    elmnt.style.backgroundColor = color;
}

function onKeyUp_searchGames() {

    if (searchFlag) {

        clearTimeout(searchHandler);
        searchHandler = window.setTimeout(search_games, search_timer);
        searchFlag = false;
    }
    else {

        searchFlag = true;
        searchHandler = window.setTimeout(search_games, search_timer);
    }
}

function search_games() {

    const searchData = $('#search-game').val();

    $.get('/game-info.json', { 'search': searchData }, (result) => {

        let artwork_url = '';
        const results = JSON.parse(result);
        $('#homepage-display').html(`<div class=\"display-search-text\" id=\"display-search-text\">Showing ${results.length} results:</div>`);
        $('#homepage-display').append("<div class=\"grid-display-search-results\" id=\"display-search-results\"></div>");

        for (let i = 0; i < results.length; i++) {

            let date = '';

            if (results[i].first_release_date) {

                const timestamp = new Date(results[i].first_release_date * 1000);
                date = timestamp.getDate() + "/" + (`${timestamp.getMonth()}` + 1).toString() + "/" + timestamp.getFullYear();
            }
            else {

                date = "NA";
            }

            if (results[i].artworks) {
                artwork_url = results[i]['artworks'][0]['url'];
            }
            else {
                artwork_url = "/static/img/image-placeholder.jpg";
            }

            $('#display-search-results').append(`
                <div class=\"search-result-item\" id=\"item-${results[i].id}\">
                    <img class=\"search-result-item-img\" src=${artwork_url}></img>
                    <div class=\"search-result-item-content\">
                        Name: ${results[i].name}
                        <div>Release Date: ${date}</div>
                        <div class=\"platforms\" id=\"platforms-${results[i].id}\">Plaform(s): </div>
                    </div>
                    <div>
                        <div class=\"select-game\" id=\"select-game\"></div>
                    </div>
                </div>`
            );

            if (!results[i].platforms) {
                results[i].platforms = new Array();
            }

            for (let j = 0; j < results[i].platforms.length; j++) {

                if (j == results[i].platforms.length - 1) {
                    $(`#platforms-${results[i].id}`).append(`${results[i].platforms[j].name}`);
                }
                else {
                    $(`#platforms-${results[i].id}`).append(`${results[i].platforms[j].name}, `);
                }
            }

            $(`#item-${results[i].id}`).append(`<div class=\"search-result-item-hover\" id=\"search-result-item-hover-${results[i].id}\">Create A Schedule</div>`);

            $(`#search-result-item-hover-${results[i].id}`).on('click', (evt) => {
                
                $.get(`/get-game/${results[i].name}`, (game) => {
                    
                    if (game.length !== 0) {
                        
                        createSchedule_by_game_id(game.game_id);
                    }
                    else {
                        if (results[i].artworks) {

                            createSchedule_by_game_name(results[i].name, results[i]['artworks'][0]['url']);
                        }
                        else {

                            createSchedule_by_game_name(results[i].name, artwork_url);
                        }
                    }
                });
            });
        }
    });
}









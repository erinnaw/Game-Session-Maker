"use-strict";

//tracks page number for all-schedules pages
const MAX_PAGE_NUM_PER_SET = 10;
let curr_schedule_search_page_num = 1;
let curr_schedule_search_page_set = 1;

//tracks page number for posts in schedule page
let curr_post_page_num = 1;
let curr_post_page_set = 1;

//tracks page number for games in GiantBomb search
const MAX_GAMES_PER_PAGE = 20;
let curr_game_page_num = 0;
let num_page_results = 0;
let num_total_results = 0;
let total_pages = 0;

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
let fromSearch = new Boolean(false);
let saved_search = '';

const sanitizeHTML = function (str) {
    return str.replace(/[^\w. ]/gi, function (c) {
        return '&#' + c.charCodeAt(0) + ';';
    });
};

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

    let form_data = new FormData();

    $('#homepage-display').html("<div class=\"subheader\" id=\"subheader\"><i class=\"bi bi-person-plus header-symbol\"></i> Create Account</div>");
    $('#homepage-display').append("<form class=\"registration-form\" id=\"registration-form\" action=\"/create-user\" method=\"POST\" enctype=\"multipart/form-data\"></form>");

    $('#homepage-display').append("<div class=\"warning-box\" id=\"warning-box\"></div>");
    $('#warning-box').html("Warning<br><br>Do not write your personal information on this demo site. All user information will be displayed under 'Users' in the bottom navbar. " + 
                            "Feel free to log in with an existing user account under 'Users'.<br><br>" + 
                            "<input type=\"checkbox\" name=\"agreement\" id=\"agreement\"/><label for=\"agreement\">I understand</label>");
    
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
        "<input type =\"text\" name=\"fname\" id=\"fname\" onkeydown=\"return alphaOnly(event);\">"+
        "<Label for=\"lname\">Last Name</Label>"+
        "<input type =\"text\" name=\"lname\" id=\"lname\" onkeydown=\"return alphaOnly(event);\">"+
        "<Label for=\"email\">Email*</Label>" +
        "<input type =\"email\" name=\"email\" id=\"email\">" +
        "<Label for= \"password\">Password*</Label>" +
        "<input type=\"password\" name=\"password\" id=\"password\">" +
        "<div></div><div><input type=\"checkbox\" onclick=\"showPassword()\"></input>Show Password</div>" +
        "<div></div><input type=\"submit\" value=\"Submit\" class=\"submit\">" +
        "<div></div>* required fields" +
        "<div class=\"flash-msg\" id=\"flash-msg\"></div>");

    $('#agreement').click(function () {

        if (document.getElementById('agreement').checked == true) {

            $('#warning-box').css('visibility', 'hidden');
        }
    });

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
            form_data.append("file", droppedFiles[0]);

            if (droppedFiles) {
                $('#avator-img').attr("src", URL.createObjectURL(droppedFiles[0]));
            }
        })
        .on('change', () => {

            const [file_] = file.files;
            form_data.append("file", file_);

            if (file_) {
                $('#avator-img').attr("src", URL.createObjectURL(file_));
            }
        });
    }

    $('#registration-form').on('submit', (evt) => {

        evt.preventDefault();
        let image_url = "/static/img/avator-placeholder.jpg";

        const formData = {
            "username": sanitizeHTML($('#username').val()),
            "fname": sanitizeHTML($('#fname').val()),
            "lname": sanitizeHTML($('#lname').val()),
            "email": sanitizeHTML($('#email').val()),
            "password": sanitizeHTML($('#password').val()),
            "image_path": image_url
        };

        $.post('/add-user', formData, (res) => {

            if(!res.status) {

                if (form_data.has('file')) {

                    form_data.append("user_id", res.user_id);

                    for (let key of form_data.keys()) {
                        console.log(key)
                    }

                    for (let key of form_data.values()) {
                        console.log(key)
                    }

                    $.ajax({
                        type: 'POST',
                        url: '/upload-image/new-user',
                        data: form_data,
                        contentType: false,
                        cache: false,
                        processData: false,
                        async: false,
                        success: function (res) {

                            if (res != false) {

                                console.log(res);
                            }
                        },
                    });
                }

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
        "<input type =\"email\" name=\"email\" id=\"email\" class=\"login_input\">" +
        "<Label for= \"password\" class=\"password_label\">Password</Label>" +
        "<input type=\"password\" name=\"password\" id=\"password\" class=\"login_input\">" +
        "<div></div><div><input type=\"checkbox\" onclick=\"showPassword()\"></input> Show Password</div>" +
        "<input type=\"submit\" value=\"Submit\" class=\"submit submit-login\">" +
        "<div class=\"flash-msg login-flash\" id=\"flash-msg\"></div>");

    $('#login-form').on('submit', (evt) => {
        
        evt.preventDefault();

        let formData = {
            "email": sanitizeHTML($('#email').val()),
            "password": sanitizeHTML($('#password').val())
        };

        $.post('/login', formData, (res) => {

            $('#flash-msg').html(res["flash"]);

            if (res.status === "1") {

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
    
    fromSearch = false;
    createSchedule_by_game_id();
});

$('#all-schedules').on('click', () => {

    $('#homepage-display').html("<div class=\"subheader\" id=\"subheader\"><i class=\"bi bi-calendar3 header-symbol\"></i> All Schedules</div>");
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
    $('#homepage-display').append("<div class=\"grid-display-schedules-results\" id=\"display-schedules-results\"></div>");
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

    if(fromAllGames) {

        $('#game_name').val(fromAllGames_game_name);
        fromAllGames = false;
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

    const formData = {"limit_size": $('#limit_size').val(),
                        "username": $('#username').val(),
                        "game_name": $('#game_name').val(),
                        "date": $('#date').val(),
                        "time": $('#time').val(),
                        "offset_page": curr_schedule_search_page_num - 1};
    prev_formData = formData;

    $('#display-schedules-results').html('');

    $.get('/get-schedules-active', formData, (schedules) => {

        if(!schedules[0].length) {

            $('#display-schedules-results').append("<div class=\"error-page\" id=\"error-page\">No schedules found.</div>");
        }
        else {
            for (const schedule of schedules[0]) {

                $('#display-schedules-results').append(`<div class=\"grid-display-schedule-item\" id=\"schedule-item-${schedule.schedule_id}\"></div>`);
                $(`#schedule-item-${schedule.schedule_id}`).append(`<div class=\"schedule-item-leftrows\" id=\"schedule-item-leftrows-${schedule.schedule_id}\"></div>`);
                $(`#schedule-item-${schedule.schedule_id}`).append(`<div class=\"schedule-item-rightrows\" id=\"schedule-item-rightrows-${schedule.schedule_id}\"></div>`);

                $(`#schedule-item-leftrows-${schedule.schedule_id}`).append(`<img src=\"${schedule.image_path}\" class=\"all-schedules-item-background-image\"/>`);
                $(`#schedule-item-leftrows-${schedule.schedule_id}`).append(`<div class=\"profile-schedules-item-text\">Schedule ID:</div><div class=\"profile-schedules-item-text\">${schedule.schedule_id}</div>`);
                $(`#schedule-item-leftrows-${schedule.schedule_id}`).append(`<div class=\"profile-schedules-item-text\">Host:</div><div class=\"profile-schedules-item-text\">${schedule.username}</div>`);
                $(`#schedule-item-leftrows-${schedule.schedule_id}`).append(`<div class=\"profile-schedules-item-text\">Game:</div><div class=\"profile-schedules-item-text\">${schedule.game_name}</div>`);
                $(`#schedule-item-leftrows-${schedule.schedule_id}`).append(`<div class=\"profile-schedules-item-text\">Date/Time::</div><div class=\"profile-schedules-item-text\">${schedule.datetime}</div>`);
                $(`#schedule-item-leftrows-${schedule.schedule_id}`).append(`<div class=\"profile-schedules-item-text\">Timezone:</div><div class=\"profile-schedules-item-text\">${schedule.timezone}</div>`);
                $(`#schedule-item-leftrows-${schedule.schedule_id}`).append(`<div class=\"profile-schedules-item-text\">Platform:</div><div class=\"profile-schedules-item-text\">${schedule.platform}</div>`);
                $(`#schedule-item-leftrows-${schedule.schedule_id}`).append(`<div class=\"profile-schedules-item-text\">Max User:</div><div class=\"profile-schedules-item-text\">${schedule.max_user}</div>`);
                $(`#schedule-item-leftrows-${schedule.schedule_id}`).append(`<div class=\"profile-schedules-item-text\">Max Team:</div><div class=\"profile-schedules-item-text\">${schedule.max_team}</div>`);
                $(`#schedule-item-rightrows-${schedule.schedule_id}`).append(`<div class=\"profile-schedules-item-text\">Description:</div><div class=\"profile-schedules-item-textarea">${schedule.description}</div>`);
                $(`#schedule-item-rightrows-${schedule.schedule_id}`).append(`<div class=\"view-schedule-button\" id=\"schedule-${schedule.schedule_id}\"><i class=\"bi bi-box-arrow-in-right button-symbol realign-icon\" id=\"schedule-${schedule.schedule_id}\"></i></div>`);
            
                if (schedule.status === "user") {

                    $(`#schedule-item-${schedule.schedule_id}`).append(`<div class=\"schedule-status-box\" id=\"schedule-status-box-${schedule.schedule_id}\"><i class=\"bi bi-check2-square button-symbol realign-icon shift-icon\"></i></div>`);
                    $(`#schedule-status-box-${schedule.schedule_id}`).css("color", "yellowgreen");
                    $(`#schedule-status-box-${schedule.schedule_id}`).append('<div class=\"tooltiptext\">Approved</div>');
                }
                else if (schedule.status === "host") {

                    $(`#schedule-item-${schedule.schedule_id}`).append(`<div class=\"schedule-status-box\" id=\"schedule-status-box-${schedule.schedule_id}\"><i class=\"bi bi-star button-symbol realign-icon shift-icon\"></i></div>`);
                    $(`#schedule-status-box-${schedule.schedule_id}`).css("color", "gold");
                    $(`#schedule-status-box-${schedule.schedule_id}`).append('<div class=\"tooltiptext\">Host</div>');
                }
                else if (schedule.status === "requested") {

                    $(`#schedule-item-${schedule.schedule_id}`).append(`<div class=\"schedule-status-box\" id=\"schedule-status-box-${schedule.schedule_id}\"><i class=\"bi bi-envelope-fill button-symbol realign-icon shift-icon\"></i></div>`);
                    $(`#schedule-status-box-${schedule.schedule_id}`).css("color", "black");
                    $(`#schedule-status-box-${schedule.schedule_id}`).append('<div class=\"tooltiptext\">Requested</div>');
                }
            }

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
        }
    });    
}

function view_schedule(schedule_id) {

    curr_post_page_num = 1;
    curr_post_page_set = 1;

    $.get(`/get-schedule-by-id/${schedule_id}`, (schedule) => {

        $('#homepage-display').html(`<div class=\"subheader\" id=\"subheader\">Schedule ID: ${schedule.schedule_id}</div>`);
        $('#homepage-display').append(`<div class=\"back-bar\"><div class=\"back-button\" id=\"back-button\"><i class="bi bi-arrow-left button-symbol realign-icon" id=\"back-button\"></i></div></div>`);
        $('#homepage-display').append("<div class=\"grid-display-schedules\" id=\"display-schedules\"></div>");
        $('#display-schedules').append(`<div class=\"grid-display-schedule-item-expanded\" id=\"schedule-item-${schedule.schedule_id}\"></div>`);
        $(`#schedule-item-${schedule.schedule_id}`).append(`<div class=\"grid-schedule-item-leftrows\" id=\"grid-schedule-item-leftrows-${schedule.schedule_id}\"></div>`);
        $(`#schedule-item-${schedule.schedule_id}`).append(`<div class=\"grid-schedule-item-rightrows\" id=\"grid-schedule-item-rightrows-${schedule.schedule_id}\"></div>`);

        $(`#grid-schedule-item-leftrows-${schedule.schedule_id}`).append(`<img src=\"${schedule.image_path}\" class=\"schedule-background-img\" />`);
        $(`#grid-schedule-item-leftrows-${schedule.schedule_id}`).append(`<div class=\"profile-schedules-item-text\">Host:</div><div class=\"profile-schedules-item-text\">${schedule.username}</div>`);
        $(`#grid-schedule-item-leftrows-${schedule.schedule_id}`).append(`<div class=\"profile-schedules-item-text\">Schedule ID:</div><div class=\"profile-schedules-item-text\">${schedule.schedule_id}</div>`);
        $(`#grid-schedule-item-leftrows-${schedule.schedule_id}`).append(`<div class=\"profile-schedules-item-text\">Game:</div><div class=\"profile-schedules-item-text\">${schedule.game_name}</div>`);
        $(`#grid-schedule-item-leftrows-${schedule.schedule_id}`).append(`<div class=\"profile-schedules-item-text\">Date/Time::</div><div class=\"profile-schedules-item-text\">${schedule.datetime}</div>`);
        $(`#grid-schedule-item-leftrows-${schedule.schedule_id}`).append(`<div class=\"profile-schedules-item-text\">Timezone:</div><div class=\"profile-schedules-item-text\">${schedule.timezone}</div>`);
        $(`#grid-schedule-item-leftrows-${schedule.schedule_id}`).append(`<div class=\"profile-schedules-item-text\">Platform:</div><div class=\"profile-schedules-item-text\">${schedule.platform}</div>`);
        $(`#grid-schedule-item-leftrows-${schedule.schedule_id}`).append(`<div class=\"profile-schedules-item-text\">Max User:</div><div class=\"profile-schedules-item-text\">${schedule.max_user}</div>`);
        $(`#grid-schedule-item-leftrows-${schedule.schedule_id}`).append(`<div class=\"profile-schedules-item-text\">Max Team:</div><div class=\"profile-schedules-item-text\">${schedule.max_team}</div>`);
        $(`#grid-schedule-item-rightrows-${schedule.schedule_id}`).append(`<div class=\"profile-schedules-item-text\">Description:</div><div class=\"profile-schedules-item-textarea\">${schedule.description}</div>`);

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

                $(`#schedule-item-${schedule.schedule_id}`).append(`<div class=\"view-schedule-status-box\" id=\"view-schedule-status-box-${schedule.schedule_id}\"><i class=\"bi bi-star button-symbol realign-icon\"></i></div>`);
                $(`#view-schedule-status-box-${schedule.schedule_id}`).css("color", "gold");
                $(`#view-schedule-status-box-${schedule.schedule_id}`).append('<div class=\"tooltiptext\">Host</div>');
            }
            else if (status === "requested") {

                $(`#schedule-item-${schedule.schedule_id}`).append(`<div class=\"view-schedule-status-box\" id=\"view-schedule-status-box-${schedule.schedule_id}\"><i class=\"bi bi-envelope-fill button-symbol realign-icon\"></i></div>`);
                $(`#view-schedule-status-box-${schedule.schedule_id}`).css("color", "black");
                $(`#view-schedule-status-box-${schedule.schedule_id}`).append('<div class=\"tooltiptext\">Requested</div>');
            }
            else if (status === "approved") {

                $(`#schedule-item-${schedule.schedule_id}`).append(`<div class=\"view-schedule-status-box\" id=\"view-schedule-status-box-${schedule.schedule_id}\"><i class=\"bi bi-check2-square button-symbol  realign-icon\"></i></div>`);
                $(`#view-schedule-status-box-${schedule.schedule_id}`).css("color", "green");
                $(`#view-schedule-status-box-${schedule.schedule_id}`).append('<div class=\"tooltiptext\">Approved</div>');            
            }
            else if (status === "not approved") {

                $(`#schedule-item-${schedule.schedule_id}`).append(`<div class=\"request-button\" id=\"request-${schedule.schedule_id}\">Request</div>`);
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
                        $('#request-inner').append("<div class=\"grid-request-header\" id=\"request-header\">Request Message</div>");
                        $('#request-inner').append(`<form class=\"grid-requestform\" method=\"POST\" id=\"requestform\"></form>`);
                        $('#requestform').append("<textarea name=\"description\" id=\"request-content\" rows=\"8\" cols=\"50\"></textarea>" +
                            "<button type=\"submit\" class=\"button\"><i class=\"bi bi-envelope-open button-symbol realign-icon\"></i></button>");
                        $('#request-inner').append("<div class=\"flash-msg\" id=\"flash-msg-request\"></div>");
                        
                        $(`#request-content`).css("height", "100px");
                        $(`#request-content`).css("width", "420px");
                        $(`#request-content`).css("margin-left", "20px");
                        $(`#request-form`).css("padding-left", "20px");
                        $(`#request-form`).css("padding-right", "20px");

                        $('#requestform').on('submit', (evt) => {

                            evt.preventDefault();

                            if (document.querySelector('#request-content').value == '') {

                                $('#flash-msg-request').html("Message cannot be blank.");
                            }
                            else {
                                const formData = {
                                    "user_id": user.user_id,
                                    "schedule_id": schedule.schedule_id,
                                    "content": sanitizeHTML($('#request-content').val())
                                }

                                $.post(`/request/${schedule.schedule_id}`, formData, (msg) => {

                                    $('#snackbar').html(`${msg}`);
                                    document.getElementById("snackbar").className = "show";
                                    setTimeout(function () { document.getElementById("snackbar").className = document.getElementById("snackbar").className.replace("show", ""); }, 3000);
                                    $(`#request-${schedule.schedule_id}`).replaceWith("<div class=\"view-schedule-status-box\"><i class=\"bi bi-envelope-fill button-symbol realign-icon\"></i></div>");
                                });

                                $('.button').html('<i class="bi bi-envelope button-symbol realign-icon"></i>');
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

                $(`#schedule-item-${schedule.schedule_id}`).append(`<div class=\"requested-button\"></div>`);
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
                            $('#requests-button').css("background-color", "#55B565");
                            $('#content-requests').css("background-color", "#CBF3D2");

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
                                            $(`#request-content-${request.request_id}`).append(`<div class=\"timestamp timestamp-post\" id=\"timestamp-request-${request.request_id}\">${request.time_stamp}</div>`);

                                            $(`#request-item-${request.request_id}`).append(`<div class=\"grid-approval\" id=\"approval-${request.request_id}\"></div>`);
                                            $(`#approval-${request.request_id}`).append(`<div class=\"approve-button\" id=\"approve-button-${request.request_id}\"><i class=\"bi bi-check-square button-symbol\"></i></div>`);
                                            $(`#approval-${request.request_id}`).append(`<div class=\"decline-button\" id=\"decline-button-${request.request_id}\"><i class=\"bi bi-x-square button-symbol\"></i></div>`);

                                            $(`#approve-button-${request.request_id}`).on('click', () => {

                                                $.post(`/approve-request/${request.request_id}`, (msg) => {

                                                    $('#snackbar').html(`${msg}`);
                                                    document.getElementById("snackbar").className = "show";
                                                    setTimeout(function () { document.getElementById("snackbar").className = document.getElementById("snackbar").className.replace("show", ""); }, 3000);

                                                    $(`#decline-button-${request.request_id}`).replaceWith("<div class=\"decline\" id=\"decline\"><i class=\"bi bi-x-square-fill button-symbol\"></i></div>");
                                                    $(`#approve-button-${request.request_id}`).replaceWith("<div class=\"approved\" id=\"approved\"><i class=\"bi bi-check-square-fill button-symbol\"></i></div>");
                                                });
                                            });

                                            $(`#decline-button-${request.request_id}`).on('click', () => {

                                                $.post(`/decline-request/${request.request_id}`, (msg) => {

                                                    $('#snackbar').html(`${msg}`);
                                                    document.getElementById("snackbar").className = "show";
                                                    setTimeout(function () { document.getElementById("snackbar").className = document.getElementById("snackbar").className.replace("show", ""); }, 3000);

                                                    $(`#decline-button-${request.request_id}`).replaceWith("<div class=\"declined\" id=\"declined\"><i class=\"bi bi-x-square-fill button-symbol\"></i></div>");
                                                    $(`#approve-button-${request.request_id}`).replaceWith("<div class=\"approve\" id=\"approve\"><i class=\"bi bi-check-square-fill button-symbol\"></i></div>");
                                                });
                                            });
                                        }
                                    }
                                });
                            });
                        }

                        $('#display-schedules').append("<button type=\"button\" class=\"collapsible\" id=\"approval-button\">See all approved users</button>" +
                            "<div class=\"content-approved-users\" id=\"content-approved\"></div>");
                        $('#approval-button').css("background-color", "#97B555");
                        $('#content-approved').css("background-color", "#DBF4A7");

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
                            "<div class=\"grid-post-msg\">" +
                            "<textarea name=\"message\" id=\"message\" rows=\"6\" cols=\"60\"></textarea>" +
                            "<button type=\"submit\" class=\"button\"><i class=\"bi bi-pen button-symbol button-symbol realign-icon\"></i></button>" +
                            "</form></div>" +
                            "<div class=\"flash-msg\" id=\"flash-msg\"></div>");
                        $('#message').css("height","100")
                        $('#message').css("margin-top", "10px")
                        $('#homepage-display').append("<div class=\"grid-display-bar\" id=\"display-bar\"><div class=\"search-schedule-item\">Show</div><select name=\"max_posts\" id=\"max_posts\"></select></div>");
                        $('#display-bar').css("background-color", "#7067CF");
                        $('#max_posts').append("<option value=\"10\">10</option>" +
                            "<option value=\"20\" selected>20</option>" +
                            "<option value=\"50\">50</option>" +
                            "<option value=\"100\">100</option>");
                        $('#homepage-display').append("<div class=\"schedule-post-canvas\" id=\"schedule-post-canvas\"></div>");
                        $('#homepage-display').append("<div class=\"display-page-num\" id=\"display-page-num\"></div>");

                        $('#max_posts').on('change', () => {

                            curr_post_page_num = 1;
                            get_scheduleposts(schedule.schedule_id, schedule.user_id);
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
                                    "content": sanitizeHTML($('#message').val())
                                };

                                $.post('/add-post', formData, (res) => {

                                    document.querySelector('#message').value = '';
                                    $('#flash-msg').html(res);
                                    $('#schedule-post-canvas').html("");

                                    get_scheduleposts(schedule.schedule_id, schedule.user_id);
                                });
                            }
                        });

                        get_scheduleposts(schedule.schedule_id, schedule.user_id)
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

function get_scheduleposts(schedule_id, host_id) {

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
                $(`#postcontent-${post.post_id}`).append(`<div class=\"postmsgbox\"><p>${post.content}</p></div>`);
                $(`#postcontent-${post.post_id}`).append('<div class=\"triangle\"></div>');
                $(`#postcontent-${post.post_id}`).append(`<div class=\"timestamp timestamp-post\">${post.time_stamp}</div>`);

                if (post.user_id == host_id) {

                    $(`#scheduleposts-${post.post_id}`).css("background-color", "#FAFAD2 ");
                }
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
        `<div class="profile-user-item" id="row-1">User ID:</div>` +
        `<div class="profile-user-item" id="row-1">${user.user_id}</div>` +
        `<div class="profile-user-item" id="row-2">Username:</div>` +
        `<div class="profile-user-item" id="edit-username">${user.username}</div>` +
        `<div class="profile-user-item" id="row-3">First Name:</div>` +
        `<div class="profile-user-item" id="edit-firstname">${user.firstname}</div>` +
        `<div class="profile-user-item" id="row-4">Last Name:</div>` +
        `<div class="profile-user-item" id="edit-lastname">${user.lastname}</div>` +
        `<div class="profile-user-item" id="row-5">Email:</div>` +
        `<div class="profile-user-item" id="edit-email">${user.email}</div>` +
        `<div class="profile-user-item" id="row-6">Password:</div>` +
        `<div class="profile-user-item" id="edit-password">${user.password}</div>`)
}

function get_userschedule_created(schedule) {

    let str = '';

    if (schedule['isArchived']) {

        str = `<span class=\"status-archived\">Archived</span>`;
    }
        
    else {

        str = `<span class=\"status-not-archived\">Active</span>`;
    }

    $(`#profile-created-item-leftrows-${schedule["schedule_id"]}`).append(`<img src=\"${schedule['image_path']}\" class=\"schedule-item-background\"/>`);
    $(`#profile-created-item-leftrows-${schedule["schedule_id"]}`).append(`<div class=\"profile-schedules-item-text\">Schedule ID:</div><div class=\"profile-schedules-item-text\">${schedule['schedule_id']}</div>`);
    $(`#profile-created-item-leftrows-${schedule["schedule_id"]}`).append(`<div class=\"profile-schedules-item-text\">Host:</div><div class=\"profile-schedules-item-text\">${schedule['host_username']}</div>`);
    $(`#profile-created-item-leftrows-${schedule["schedule_id"]}`).append(`<div class=\"profile-schedules-item-text\">Game:</div><div class=\"profile-schedules-item-text\">${schedule['game_name']}</div>`);
    $(`#profile-created-item-leftrows-${schedule["schedule_id"]}`).append(`<div class=\"profile-schedules-item-text\">Date/Time:</div><div class=\"profile-schedules-item-text\">${schedule['datetime']}</div>`);
    $(`#profile-created-item-leftrows-${schedule["schedule_id"]}`).append(`<div class=\"profile-schedules-item-text\">Timezone:</div><div class=\"profile-schedules-item-text\">${schedule['timezone']}</div>`);
    $(`#profile-created-item-leftrows-${schedule["schedule_id"]}`).append(`<div class=\"profile-schedules-item-text\">Plaform:</div><div class=\"profile-schedules-item-text\">${schedule['platform']}</div>`);

    $(`#profile-created-item-rightrows-${schedule["schedule_id"]}`).append(`<div class=\"profile-schedules-item-text\">Description:</div>`);
    $(`#profile-created-item-rightrows-${schedule["schedule_id"]}`).append(`<div class=\"profile-schedules-item-textarea\">${schedule['description']}</div>`);
    $(`#profile-created-item-rightrows-${schedule["schedule_id"]}`).append(`<div class=\"profile-schedules-item-text\">Status: ` + str + `</div>`);
}

function get_userschedule_joined(schedule) {

    let str = '';

    if (schedule['isArchived']) {

        str = `<span class=\"status-archived\">Archived</span>`;
    }

    else {

        str = `<span class=\"status-not-archived\">Active</span>`;
    }

    $(`#profile-joined-item-leftrows-${schedule["schedule_id"]}`).append(`<img src=\"${schedule['image_path']}\" class=\"schedule-item-background\"/>`);
    $(`#profile-joined-item-leftrows-${schedule["schedule_id"]}`).append(`<div class=\"profile-schedules-item-text\">Schedule ID:</div><div class=\"profile-schedules-item-text\">${schedule['schedule_id']}</div>`);
    $(`#profile-joined-item-leftrows-${schedule["schedule_id"]}`).append(`<div class=\"profile-schedules-item-text\">Host:</div><div class=\"profile-schedules-item-text\">${schedule['host_username']}</div>`);
    $(`#profile-joined-item-leftrows-${schedule["schedule_id"]}`).append(`<div class=\"profile-schedules-item-text\">Game:</div><div class=\"profile-schedules-item-text\">${schedule['game_name']}</div>`);
    $(`#profile-joined-item-leftrows-${schedule["schedule_id"]}`).append(`<div class=\"profile-schedules-item-text\">Date/Time:</div><div class=\"profile-schedules-item-text\">${schedule['datetime']}</div>`);
    $(`#profile-joined-item-leftrows-${schedule["schedule_id"]}`).append(`<div class=\"profile-schedules-item-text\">Timezone:</div><div class=\"profile-schedules-item-text\">${schedule['timezone']}</div>`);
    $(`#profile-joined-item-leftrows-${schedule["schedule_id"]}`).append(`<div class=\"profile-schedules-item-text\">Plaform:</div><div class=\"profile-schedules-item-text\">${schedule['platform']}</div>`);

    $(`#profile-joined-item-rightrows-${schedule["schedule_id"]}`).append(`<div class=\"profile-schedules-item-text\">Description:</div>`);
    $(`#profile-joined-item-rightrows-${schedule["schedule_id"]}`).append(`<div class=\"profile-schedules-item-textarea\">${schedule['description']}</div>`);
    $(`#profile-joined-item-rightrows-${schedule["schedule_id"]}`).append(`<div class=\"profile-schedules-item-text\">Status: ` + str + `</div>`);
}

function get_userschedule_archived(schedule) {

    let str = '';

    if (schedule['isArchived']) {

        str = `<span class=\"status-archived\">Archived</span>`;
    }

    else {

        str = `<span class=\"status-not-archived\">Active</span>`;
    }

    $(`#profile-archived-item-leftrows-${schedule["schedule_id"]}`).append(`<img src=\"${schedule['image_path']}\" class=\"schedule-item-background\"/>`);
    $(`#profile-archived-item-leftrows-${schedule["schedule_id"]}`).append(`<div class=\"profile-schedules-item-text\">Schedule ID:</div><div class=\"profile-schedules-item-text\">${schedule['schedule_id']}</div>`);
    $(`#profile-archived-item-leftrows-${schedule["schedule_id"]}`).append(`<div class=\"profile-schedules-item-text\">Host:</div><div class=\"profile-schedules-item-text\">${schedule['host_username']}</div>`);
    $(`#profile-archived-item-leftrows-${schedule["schedule_id"]}`).append(`<div class=\"profile-schedules-item-text\">Game:</div><div class=\"profile-schedules-item-text\">${schedule['game_name']}</div>`);
    $(`#profile-archived-item-leftrows-${schedule["schedule_id"]}`).append(`<div class=\"profile-schedules-item-text\">Date/Time:</div><div class=\"profile-schedules-item-text\">${schedule['datetime']}</div>`);
    $(`#profile-archived-item-leftrows-${schedule["schedule_id"]}`).append(`<div class=\"profile-schedules-item-text\">Timezone:</div><div class=\"profile-schedules-item-text\">${schedule['timezone']}</div>`);
    $(`#profile-archived-item-leftrows-${schedule["schedule_id"]}`).append(`<div class=\"profile-schedules-item-text\">Plaform:</div><div class=\"profile-schedules-item-text\">${schedule['platform']}</div>`);

    $(`#profile-archived-item-rightrows-${schedule["schedule_id"]}`).append(`<div class=\"profile-schedules-item-text\">Description:</div>`);
    $(`#profile-archived-item-rightrows-${schedule["schedule_id"]}`).append(`<div class=\"profile-schedules-item-textarea\">${schedule['description']}</div>`);
    $(`#profile-archived-item-rightrows-${schedule["schedule_id"]}`).append(`<div class=\"profile-schedules-item-text\">Status: ` + str + `</div>`);
}

function get_userrequest_html(request) {

    type = "";

    if (request.type === "sent") {

        type = "Host:"
    }
    else if(request.type === "received") {

        type = "From:"
    }
    
    $(`#profile-schedule-item-leftrows-${request["request_id"]}`).append(`<img src=\"${request['postmark_image']}\" class=\"sent-item-background\"/>`);
    $(`#profile-schedule-item-leftrows-${request["request_id"]}`).append(`<div class=\"profile-schedules-item-text\">Schedule ID:</div><div class=\"profile-schedules-item-text\">${request['schedule_id']}</div>`);
    $(`#profile-schedule-item-leftrows-${request["request_id"]}`).append(`<div class=\"profile-schedules-item-text\">${type}</div><div class=\"profile-schedules-item-text\">${request['username']}</div>`);
    $(`#profile-schedule-item-leftrows-${request["request_id"]}`).append(`<div class=\"profile-schedules-item-text\">Game:</div><div class=\"profile-schedules-item-text\">${request['game_name']}</div>`);
    $(`#profile-schedule-item-leftrows-${request["request_id"]}`).append(`<div class=\"profile-schedules-item-text\">Date/Time:</div><div class=\"profile-schedules-item-text\">${request['schedule_datetime']}</div>`);
    $(`#profile-schedule-item-leftrows-${request["request_id"]}`).append(`<div class=\"profile-schedules-item-text\">Timezone:</div><div class=\"profile-schedules-item-text\">${request['schedule_timezone']}</div>`);

    $(`#profile-schedule-item-rightrows-${request["request_id"]}`).append(`<div class=\"profile-schedules-item-text\">Message:</div>`);
    $(`#profile-schedule-item-rightrows-${request["request_id"]}`).append(`<div class=\"profile-schedules-item-textarea\">${request['content']}</div>`);
    $(`#profile-schedule-item-rightrows-${request["request_id"]}`).append(`<div class=\"profile-schedules-item-text\"> ${request['time_stamp']}</div>`);
}

function get_userpost_html(post) {

    $(`#profile-userposts-leftrows-${post["post_id"]}`).append(`<div class=\"profile-schedules-item-text\">Schedule ID:</div><div class=\"profile-schedules-item-text\">${post['schedule_id']}</div>`);
    $(`#profile-userposts-leftrows-${post["post_id"]}`).append(`<div class=\"profile-schedules-item-text\">Post Content:</div><div></div>`);
    $(`#profile-userposts-leftrows-${post["post_id"]}`).append(`<div class=\"profile-schedules-item-text\">Time Stamp:</div><div class=\"profile-schedules-item-text\">${post['time_stamp']}</div>`);

    $(`#profile-userposts-rightrows-${post["post_id"]}`).append(`<div></div>`);
    $(`#profile-post-${post["post_id"]}`).append(`<div class=\"profile-post-item-textarea\">${post['content']}</div>`);
}

function createSchedule_by_game_id(game_id = 1) {

    $.get('/profile', (user) => {
        if (user === "None") {
            $('#homepage-display').html("<div class=\"error-page\" id=\"error-page\">You must be signed in to create a schedule.</div>");
        }
        else {
            $('#homepage-display').html("<div class=\"subheader\" id=\"subheader\"><i class=\"bi bi-calendar2-plus header-symbol\"></i> Create a Schedule</div>");

            if(fromSearch) {

                fromSearch = false;
                append_back_to_search();
            }

            $('#homepage-display').append("<form class=\"schedule-form\" id=\"schedule-form\" action=\"/create-schedule\" method=\"POST\"></form>");
            $('#schedule-form').append("<div class=\"grid-create-schedule-form\" id=\"create-schedule-form\"></div>");
            $('#create-schedule-form').append(`<Label for=\"game\" id=\"game\">Game*</Label><select name=\"game\" id=\"gameselect\"></select>`);
            
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

            $('#create-schedule-form').append("<Label for=\"platform\" id=\"platform_label\">Platform</Label>" +
                "<select name=\"platform\" id=\"platform\"></select>");

            $.get(`/get-game/${game_id}`, (game) => {

                for (const platform of game[0].platforms) {

                    $('#platform').append(`<option value=\"${platform.platform_id}\">${platform.name.charAt(0).toUpperCase() + platform.name.slice(1)}</option>`);
                }
            });
            
            $('#gameselect').on('change', () => {

                $.get(`/get-game/${$('#gameselect').val()}`, (game) => {

                    $('#platform').html('');
                    for (const platform of game[0].platforms) {

                        $('#platform').append(`<option value=\"${platform.platform_id}\">${platform.name.charAt(0).toUpperCase() + platform.name.slice(1)}</option>`);
                    }
                });
            });  

            $('#create-schedule-form').append("<Label for=\"max_user\">Max Users*</Label>" +
                "<input type=\"number\" min=\"1\" step=\"1\" name=\"max_user\" id=\"max_user\">" +
                "<Label for=\"max_team\">Max Teams</Label>" +
                "<input type=\"number\" min=\"1\" step=\"1\" name=\"max_team\" id=\"max_team\" placeholder=\"1\">" +
                "<Label for=\"description\">Description*</Label>" +
                "<textarea name=\"description\" id=\"description\" rows=\"10\" cols=\"50\">Write requirements for users and description of your objective(s).</textarea> " +
                "<div></div>" +
                "<input type=\"submit\" value=\"Submit\" class=\"submit submit-login\">" +
                "<div></div>" +
                "<center>*required fields</center>");

            $('#homepage-display').append("<div class=\"flash-msg\" id=\"flash-msg\"></div");

            $('#schedule-form').on('submit', (evt) => {

                evt.preventDefault();

                const formData = {
                    "game": $('#gameselect').val(),
                    "date": $('#date').val(),
                    "time": $('#time').val(),
                    "timezone": $('#timezone option:selected').text(),
                    "platform": $('#platform').val(),
                    "description": sanitizeHTML($('#description').val()),
                    "max_user": $('#max_user').val(),
                    "max_team": $('#max_team').val()
                };

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

function createSchedule_by_game_name(game_name, image_path, icon_path, description, platforms, site_detail_url) {

    $.get('/profile', (user) => {

        if (user === "None") {

            $('#homepage-display').html("<div class=\"error-page\" id=\"error-page\">You must be signed in to create a schedule.</div>");
        }
        else {

            let platforms_query = '&platforms=';
           
            $('#homepage-display').html("<div class=\"subheader\" id=\"subheader\"><i class=\"bi bi-calendar2-plus header-symbol\"></i> Create a Schedule</div>");

            if (fromSearch) {

                fromSearch = false;
                append_back_to_search();
            }

            $('#homepage-display').append(`<div class=\"grid-display-game\" id=\"display-game\"></div>`);
            $('#display-game').append(`<img class=\"display-game-icon\" src=\"${image_path}\"></img>`);
            $('#display-game').append(`<div class=\"game-description\"><h3>${game_name}</h3><p>${description}</p>` + 
                                        `<div class=\"grid-gb-link\"><p><a href=\"${site_detail_url}\" target=\"_blank\">Link to game details provided by GiantBomb ` +
                                        `<i class="bi bi-box-arrow-up-right"></i></p>` +
                                        `<img class=\"giantbomb-logo\" src=\"/static/img/giantbomb.jpg\"/></div></div>`);
            
            $('#homepage-display').append("<form class=\"schedule-form\" id=\"schedule-form\" action=\"/create-schedule\" method=\"POST\"></form>");
            $('#schedule-form').append("<div class=\"grid-create-schedule-form\" id=\"create-schedule-form\"></div>");
            $('#create-schedule-form').append(`<Label for=\"game\">Game*</Label><input type=\"hidden\" name=\"game\" id=\"gameselect\" value=\"${game_name}\"></input><div>${game_name}</div>`);
            $('#create-schedule-form').append(`<input type=\"hidden\" name=\"image_path\" id=\"image_path\" value=\"${image_path}\"></input>`);
            $('#create-schedule-form').append(`<input type=\"hidden\" name=\"icon_path\" id=\"icon_path\" value=\"${icon_path}\"></input>`);

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
                "<select name=\"platform\" id=\"platform\"></select>")

            for (const platform of platforms) {

                $('#platform').append(`<option value=\"${platform}\">${platform.charAt(0).toUpperCase() + platform.slice(1)}</option>`);
                platforms_query += `${platform}+`;
            }

            $('#create-schedule-form').append("<Label for=\"max_user\">Max Users*</Label>" +
                "<input type=\"number\" min=\"1\" step=\"1\" name=\"max_user\" id=\"max_user\">" +
                "<Label for=\"max_team\">Max Teams</Label>" +
                "<input type=\"number\" min=\"1\" step=\"1\" name=\"max_team\" id=\"max_team\" placeholder=\"1\">" +
                "<Label for=\"description\">Description*</Label>" +
                "<textarea name=\"description\" id=\"description\" rows=\"10\" cols=\"50\">Write requirements for users and description of your objective(s).</textarea> " +
                "<div></div>" +
                "<input type=\"submit\" value=\"Submit\" class=\"submit submit-login\">" +
                "<div></div>" +
                "<center>*required fields</center>");

            $('#homepage-display').append("<div class=\"flash-msg\" id=\"flash-msg\"></div");

            $('#schedule-form').on('submit', (evt) => {

                evt.preventDefault();

                const params = {
                    "game": $('#gameselect').val(),
                    "image_path": $('#image_path').val(),
                    "icon_path": $('#icon_path').val(),
                    "date": $('#date').val(),
                    "time": $('#time').val(),
                    "timezone": $('#timezone option:selected').text(),
                    "platform": $('#platform').val(),
                    "description": sanitizeHTML($('#description').val()),
                    "max_user": $('#max_user').val(),
                    "max_team": $('#max_team').val(),
                    "platforms_query": platforms_query
                };

                const formData = jQuery.param(params) + platforms_query;
                console.log(formData)
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

    curr_game_page_num = 0;
    num_page_results = 0;
    num_total_results = 0;
    const searchData = sanitizeHTML($('#search-game').val());
    loading_screen();

    $.get('/game-info.json', {'search': searchData, "limit": MAX_GAMES_PER_PAGE, "page_offset": curr_game_page_num}, (response) => {

        //response index: [1] num_page_results [2] num_total_results [3] results
        let icon_url = '';
        const results_ = JSON.parse(response);
        num_page_results = results_[1];
        num_total_results = results_[2];
        total_pages = Math.ceil(num_total_results/MAX_GAMES_PER_PAGE);
        const results = results_[3];

        if (curr_game_page_num < total_pages) {

            $('#homepage-display').html(`<div class=\"display-search-text\" id=\"display-search-text\">Showing ${num_page_results} out of ${num_total_results} results:</div>`);
            $('#homepage-display').append("<div class=\"grid-display-search-results\" id=\"display-search-results\"></div>");
            
            for (let i = 0; i < results.length; i++) {

                const release_date = new Date(results[i].original_release_date);
                
                if (results[i].image) {
                    icon_url = results[i].image['icon_url'];
                }
                else {
                    icon_url = "/static/img/image-placeholder.jpg";
                }

                $('#display-search-results').append(`
                    <div class=\"search-result-item\" id=\"item-${results[i].id}\">
                        <img class=\"search-result-item-img\" src=${icon_url}></img>
                        <div class=\"search-result-item-content\">
                            Name: ${results[i].name}
                            <div>Release Date: ${release_date.getMonth()}/${release_date.getDate()}/${release_date.getFullYear()}</div>
                            <div class=\"platforms\" id=\"platforms-${results[i].id}\">Plaform(s): </div>
                        </div>
                    </div>`
                );

                if(results[i].platforms) {

                    for (let j = 0; j < results[i].platforms.length; j++) {

                        if (j == results[i].platforms.length - 1) {
                            $(`#platforms-${results[i].id}`).append(`${results[i].platforms[j].name}`);
                        }
                        else {
                            $(`#platforms-${results[i].id}`).append(`${results[i].platforms[j].name}, `);
                        }
                    }
                }
                else {
                
                    $(`#platforms-${results[i].id}`).append({"":"N/A"});
                }

                $(`#item-${results[i].id}`).append(`<div class=\"search-result-item-hover\" id=\"search-result-item-hover-${results[i].id}\">Create A Schedule</div>`);

                $(`#search-result-item-hover-${results[i].id}`).on('click', (evt) => {

                    $.get('/get-game', {"name": results[i].name}, (game) => {

                        if (game.length !== 0) {

                            fromSearch = true;
                            saved_search = sanitizeHTML($('#search-game').val());
                            createSchedule_by_game_id(game.game_id);
                        }
                        else {

                            loading_screen();
                            
                            $.get('/get-game-info-GB', {"game_id": evt.target.id.slice(25)}, (res) => {
                                
                                fromSearch = true;
                                saved_search = sanitizeHTML($('#search-game').val());
                                createSchedule_by_game_name(results[i].name, res.super_url, res.icon_url, res.deck, res.platforms, res.site_detail_url);
                            });
                        }
                    });              
                });
            }

            if (curr_game_page_num + 1 >= total_pages) {

                $("#search-results-loading").remove();
                $("#display-search-results").append("<div class=\"search-results-text\" id=\"search-results-text\"></div>");
                $("#search-results-text").html("End of Search Results");
            }
            else {

                $("#search-results-loading").remove();
                $("#display-search-results").append("<div class=\"search-results-loading bounce\" id=\"search-results-loading\"></div>");
                $("#search-results-loading").html("Scroll down to load more results");
            }

            $("#display-search-results").on('scroll', () => {

                if ($("#display-search-results").scrollTop() + $("#display-search-results").innerHeight() >= $("#display-search-results")[0].scrollHeight) {

                    if (curr_game_page_num < total_pages) {

                        curr_game_page_num += 1;
                        saved_search = sanitizeHTML($('#search-game').val());

                        $("#search-results-loading").remove();
                        $("#display-search-results").append("<div class=\"search-results-loading bounce\" id=\"search-results-loading\"></div>");
                        $("#search-results-loading").html("Scroll down to load more results");

                        lazy_loading();
                                                
                        if (curr_game_page_num >= total_pages) {

                            $("#search-results-loading").remove();
                            $("#display-search-results").append("<div class=\"search-results-text\" id=\"search-results-text\"></div>");
                            $("#search-results-text").html("End of Search Results");
                        }
                    }
                }           
            });
        }
    });
}

function loading_screen () {

    $('#homepage-display').html('<div class=\"grid-loading-display\" id=\"loading-display\"><img src=\"/static/img/load-icon.gif\" class=\"load-icon\"/><p>Retrieving Data...</p></div>');
}

function lazy_loading () {

    if (curr_game_page_num < total_pages) {

        $.get('/game-info.json', { 'search': saved_search, "limit": MAX_GAMES_PER_PAGE, "page_offset": curr_game_page_num }, (response) => {

            //response index: [1] num_page_results [2] num_total_results [3] results
            let icon_url = '';
            const results_ = JSON.parse(response);
            num_page_results += results_[1];
            const results = results_[3];

            $('#display-search-text').html(`Showing ${num_page_results} out of ${num_total_results} results:`);

            for (let i = 0; i < results.length; i++) {

                const release_date = new Date(results[i].original_release_date);

                if (results[i].image) {
                    icon_url = results[i].image['icon_url'];
                }
                else {
                    icon_url = "/static/img/image-placeholder.jpg";
                }

                $('#display-search-results').append(`
                    <div class=\"search-result-item\" id=\"item-${results[i].id}\">
                        <img class=\"search-result-item-img\" src=${icon_url}></img>
                        <div class=\"search-result-item-content\">
                            Name: ${results[i].name}
                            <div>Release Date: ${release_date.getMonth()}/${release_date.getDate()}/${release_date.getFullYear()}</div>
                            <div class=\"platforms\" id=\"platforms-${results[i].id}\">Plaform(s): </div>
                        </div>
                        <div>
                            <div class=\"select-game\" id=\"select-game\"></div>
                        </div>
                    </div>`
                );

                if (results[i].platforms) {

                    for (let j = 0; j < results[i].platforms.length; j++) {

                        if (j == results[i].platforms.length - 1) {
                            $(`#platforms-${results[i].id}`).append(`${results[i].platforms[j].name}`);
                        }
                        else {
                            $(`#platforms-${results[i].id}`).append(`${results[i].platforms[j].name}, `);
                        }
                    }
                }
                else {

                    $(`#platforms-${results[i].id}`).append({ "": "N/A" });
                }

                $(`#item-${results[i].id}`).append(`<div class=\"search-result-item-hover\" id=\"search-result-item-hover-${results[i].id}\">Create A Schedule</div>`);

                $(`#search-result-item-hover-${results[i].id}`).on('click', (evt) => {

                    $.get('/get-game', { "name": results[i].name }, (game) => {

                        if (game.length !== 0) {

                            fromSearch = true;
                            saved_search = sanitizeHTML($('#search-game').val());
                            createSchedule_by_game_id(game.game_id);
                        }
                        else {

                            loading_screen();

                            $.get('/get-game-info-GB', { "game_id": evt.target.id.slice(25) }, (res) => {

                                fromSearch = true;
                                saved_search = sanitizeHTML($('#search-game').val());
                                createSchedule_by_game_name(results[i].name, res.super_url, res.icon_url, res.deck, res.platforms, res.site_detail_url);
                            });
                        }
                    });
                });
            }
        });
    }
}

function append_back_to_search () {

    $('#homepage-display').append('<div class=\"back-to-search-bar\" id=\"back-to-search\"><div/><div class=\"back-to-search-button\" id=\"back-to-search-button\">Back to search results</div></div>');

    $('#back-to-search-button').on('click', () => {

        $('#search-game').val(saved_search);
        search_games();
    });
}

function alphaOnly(evt) {

    let key = evt.keyCode;
    return (((key >= 65 && key <= 90) || key == 8 || key == 9) && key != 13);
}

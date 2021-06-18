"use-strict";

let curr_userpost_page_set = 1;
let curr_userpost_page_num = 1;

$('#my-profile').on('click', () => {

    $.get('/profile', (res) => {

        if (res == "None") {
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
            $('#profile-display').append(`<img class=\"avator-img-profile\" id=\"avator-img-edit\" src=\"${res.image_path}\"></img>`);
            $('#profile-display').append("<div class=\"grid-profile-user\" id=\"profile-user\"></div>");
            $('#profile-user').html(get_userdetails_html(res));
            $('#profile-display').append("<div class=\"edit-profile-button\" id=\"edit-profile\">Edit Profile</div>");
            $('#profile-display').append("<div class=\"flash-msg\" id=\"flash-msg\"></div");

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

            $('#edit-profile').on('click', () => {

                $('#avator-img-edit').replaceWith("<form class=\"avator-upload-form\" id=\"avator-upload-form\" method=\"post\">");
                $('#avator-upload-form').append("<img class=\"avator-img-profile-upload\" id=\"avator-img\" src=\"\"></img>");
                $('#avator-upload-form').append("<div class=\"drop-area\" id=\"drop-area\"></div>");
                $('#drop-area').append("<input accept=\"image/*\" type=\"file\" class=\"file-box\" name=\"files[]\" id=\"file\" data-multiple-caption=\"{count} files selected\" multiple></input>" +
                    "<br><label for=\"file\"><strong>Select an image</strong><br>" +
                    "<span class=\"dragdrop-box\">or drag and drop</span></label>");

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

                $('#edit-firstname').replaceWith("<input onkeydown=\"return (event.keyCode != 13);\"/ type=\"text\" name=\"firstname\" id=\"firstname\" class=\"edit-firstname-text\"></input>");
                $('#edit-lastname').replaceWith("<input onkeydown=\"return (event.keyCode != 13);\"/ type=\"text\" name=\"lastname\" id=\"lastname\" class=\"edit-lastname-text\"></input>");
                $('#edit-email').replaceWith("<input onkeydown=\"return (event.keyCode != 13);\"/ type=\"email\" name=\"email\" id=\"email\" class=\"edit-email-text\"></input>");
                $('#edit-password').replaceWith("<input onkeydown=\"return (event.keyCode != 13);\"/ type=\"\" name=\"password\" id=\"password\" class=\"edit-password-text\"></input>");
                $('#edit-profile').replaceWith("<div class=\"save-changes-button\" id=\"save-changes\">Save Changes</div></form>");

                $('#firstname').val(`${res.firstname}`);
                $('#lastname').val(`${res.lastname}`);
                $('#email').val(`${res.email}`);
                $('#password').val(`${res.password}`);
                $('#avator-img').attr("src", res.image_path);

                $('#save-changes').on('click', () => {

                    if ($('#email').val() == '' || $('#password').val() == '') {

                        $('#flash-msg').html("Email and Password cannot be blank.");
                        return;
                    }
                    else {

                        const formData = {
                            "fname": $('#firstname').val(),
                            "lname": $('#lastname').val(),
                            "email": $('#email').val(),
                            "password": $('#password').val(),
                            "image_path": $('#avator-img').attr('src')
                        }

                        $.post('/edit-profile', formData, (msg) => {

                            $('#snackbar').html(msg);
                            document.getElementById("snackbar").className = "show";
                            setTimeout(function () { document.getElementById("snackbar").className = document.getElementById("snackbar").className.replace("show", ""); }, 3000);
                            $('#my-profile').trigger('click');
                        });
                    }
                });
            });

            $('#profile-menu-user').on('click', () => {

                $('#my-profile').trigger('click');
            });

            $('#profile-menu-schedules').on('click', () => {

                $('#profile-display').html("<div class=\"profile-subheader\">My Schedules</div>");
                $('#profile-display').append("<div class=\"grid-profile-schedules\" id=\"profile-schedules\"></div>");

                $('#profile-schedules').append('<div class=\"grid-schedules-tabs\" id=\"schedules-tabs\"></div>');
                $('#schedules-tabs').append('<button class=\"tablink\" onclick=\"openPage(\'created\', this, \'lightgrey\')\" id=\"created-tab\">Created</button>');
                $('#schedules-tabs').append('<button class=\"tablink\" onclick=\"openPage(\'joined\', this, \'lightgrey\')\" id=\"joined-tab\">Joined</button>');
                $('#schedules-tabs').append('<button class=\"tablink\" onclick=\"openPage(\'archived\', this, \'lightgrey\')\" id=\"archived-tab\">Archived</button>');
                $('#profile-schedules').append('<div id=\"created\" class=\"tabcontent\"></div>');
                $('#profile-schedules').append('<div id=\"joined\" class=\"tabcontent\"></div>');
                $('#profile-schedules').append('<div id=\"archived\" class=\"tabcontent\"></div>');

                $('#created').append("<div class=\"grid-display-bar\" id=\"display-bar\"><div class=\"search-schedule-item\">Show</div><select name=\"max_userschedules\" id=\"max_userschedules\" onchange=\"get_userschedules_created()\"></select></div>");
                $('#max_userschedules').append("<option value=\"10\">10</option>" +
                    "<option value=\"20\" selected>20</option>" +
                    "<option value=\"50\">50</option>" +
                    "<option value=\"100\">100</option>");
                $('#created').append("<div class=\"user-post-canvas\" id=\"user-post-canvas\"></div>");
                $('#created').append("<div class=\"display-page-num\" id=\"display-page-num\"></div>");

                $('#created-tab').on('click', () => {

                    curr_userpost_page_set = 1;
                    curr_userpost_page_num = 1;
                    get_userschedules_created();
                });

                $('#joined-tab').on('click', () => {

                    $('#joined').html("<div class=\"grid-display-bar\" id=\"display-bar\"><div class=\"search-schedule-item\">Show</div><select name=\"max_userschedules_joined\" id=\"max_userschedules_joined\" onchange=\"get_userschedules_joined()\"></select></div>");
                    $('#max_userschedules_joined').append("<option value=\"10\">10</option>" +
                        "<option value=\"20\" selected>20</option>" +
                        "<option value=\"50\">50</option>" +
                        "<option value=\"100\">100</option>");
                    $('#joined').append("<div class=\"user-post-canvas\" id=\"user-post-joined-canvas\"></div>");
                    $('#joined').append("<div class=\"display-page-num\" id=\"display-page-num-joined\"></div>");

                    curr_userpost_page_set = 1;
                    curr_userpost_page_num = 1;
                    get_userschedules_joined();
                });

                $('#archived-tab').on('click', () => {

                    $('#archived').html("<div class=\"grid-display-bar\" id=\"display-bar\"><div class=\"search-schedule-item\">Show</div><select name=\"max_userschedules_archived\" id=\"max_userschedules_archived\" onchange=\"get_userschedules_archived()\"></select></div>");
                    $('#max_userschedules_archived').append("<option value=\"10\">10</option>" +
                        "<option value=\"20\" selected>20</option>" +
                        "<option value=\"50\">50</option>" +
                        "<option value=\"100\">100</option>");
                    $('#archived').append("<div class=\"user-post-canvas\" id=\"user-post-archived-canvas\"></div>");
                    $('#archived').append("<div class=\"display-page-num\" id=\"display-page-num-archived\"></div>");

                    curr_userpost_page_set = 1;
                    curr_userpost_page_num = 1;
                    get_userschedules_archived();
                });

                $('#created-tab').trigger('click');
            });

            $('#profile-menu-requests').on('click', () => {

                $('#profile-display').html("<div class=\"profile-subheader\">Pending Requests</div>");
                $('#profile-display').append("<div class=\"grid-profile-schedules\" id=\"profile-requests\"></div>");

                $('#profile-requests').append('<div class=\"grid-schedules-tabs\" id=\"requests-tabs\"></div>');
                $('#requests-tabs').append('<button class=\"tablink\" onclick=\"openPage(\'sent\', this, \'lightgrey\')\" id=\"sent-tab\">Sent</button>');
                $('#requests-tabs').append('<button class=\"tablink\" onclick=\"openPage(\'received\', this, \'lightgrey\')\" id=\"received-tab\">Received</button>');
                $('#profile-requests').append('<div id=\"sent\" class=\"tabcontent\"></div>');
                $('#profile-requests').append('<div id=\"received\" class=\"tabcontent\"></div>');

                $('#sent-tab').on('click', () => {

                    $.get('/user-sent-requests', (requests) => {

                        $('#sent').html('');

                        if (requests.length == 0) {

                            $('#sent').append("<div class=\"error-page\">No requests yet.</div>");
                        }

                        for (const request of requests) {

                            $('#sent').append(`<div class=\"grid-profile-schedule-item\" id=\"profile-request-sent-${request["request_id"]}\"></div>`);
                            $(`#profile-request-sent-${request["request_id"]}`).append(get_userrequest_html(request));

                            $(`#profile-request-sent-${request["request_id"]}`).append(`<div class=\"grid-user-schedule-hover\" id=\"user-request-sent-hover-${request["schedule_id"]}\"></div>`);
                            $(`#user-request-sent-hover-${request["schedule_id"]}`).html(`<div class=\"view-schedule-button-3\" id=\"view-schedule-user-${request["schedule_id"]}\">View Schedule</div><div></div>`);
                            $(`#user-request-sent-hover-${request["schedule_id"]}`).append(`<div class=\"delete-request-button-2\" id=\"delete-request-user-${request["schedule_id"]}\">Cancel Request</div><div></div>`);

                            $(`#view-schedule-user-${request["schedule_id"]}`).on('click', () => {

                                view_schedule(`${request["schedule_id"]}`);
                            });

                            $(`#delete-request-user-${request["schedule_id"]}`).on('click', () => {

                                $.post(`/delete-request/${request["request_id"]}`, (msg) => {

                                    $(`#delete-request-user-${request["schedule_id"]}`).remove();
                                    $(`#view-schedule-user-${request["schedule_id"]}`).remove();
                                    $(`#user-request-sent-hover-${request["schedule_id"]}`).append(`<div class=\"subheader-2\" id=\"subheader-${request["schedule_id"]}\">Request Cancelled</div>`);
                                    $(`#user-request-sent-hover-${request["schedule_id"]}`).css('background-color', 'rgba(255, 255, 255, 0.8)');
                                    $(`#user-request-sent-hover-${request["schedule_id"]}`).css('opacity', '1');
                                });
                            });
                        }
                    });
                });

                $('#received-tab').on('click', () => {
                    
                    $.get('/user-received-requests', (requests) => {

                        $('#received').html('');

                        if (requests.length == 0) {

                            $('#received').append("<div class=\"error-page\">No requests yet.</div>");
                        }

                        for (const request of requests) {

                            $('#received').append(`<div class=\"grid-profile-schedule-item\" id=\"profile-request-received-${request["request_id"]}\"></div>`);
                            $(`#profile-request-received-${request["request_id"]}`).append(get_userrequest_html(request));

                            $(`#profile-request-received-${request["request_id"]}`).append(`<div class=\"grid-user-schedule-hover\" id=\"user-request-received-hover-${request["schedule_id"]}\"></div>`);
                            $(`#user-request-received-hover-${request["schedule_id"]}`).html(`<div class=\"view-schedule-button-4\" id=\"view-schedule-user-${request["schedule_id"]}\">View Schedule</div><div></div>`);
                            $(`#user-request-received-hover-${request["schedule_id"]}`).append(`<div class=\"approve-request-button\" id=\"approve-request-user-${request["schedule_id"]}\">Approve</div><div></div>`);
                            $(`#user-request-received-hover-${request["schedule_id"]}`).append(`<div class=\"decline-request-button\" id=\"decline-request-user-${request["schedule_id"]}\">Decline</div><div></div>`);

                            $(`#view-schedule-user-${request["schedule_id"]}`).on('click', () => {

                                view_schedule(`${request["schedule_id"]}`);
                            });

                            $(`#approve-request-user-${request["schedule_id"]}`).on('click', () => {

                                $.post(`/approve-request/${request.request_id}`, (msg) => {

                                    $('#snackbar').html(`${msg}`);
                                    document.getElementById("snackbar").className = "show";
                                    setTimeout(function () { document.getElementById("snackbar").className = document.getElementById("snackbar").className.replace("show", ""); }, 3000);

                                    $(`#decline-request-user-${request["schedule_id"]}`).replaceWith("<div class=\"decline-2\" id=\"decline-2\">Decline</div>");
                                    $(`#approve-request-user-${request["schedule_id"]}`).replaceWith("<div class=\"approved-2\" id=\"approved-2\">Approved</div>");
                                });
                            });

                            $(`#decline-request-user-${request["schedule_id"]}`).on('click', () => {

                                $.post(`/decline-request/${request.request_id}`, (msg) => {

                                    $('#snackbar').html(`${msg}`);
                                    document.getElementById("snackbar").className = "show";
                                    setTimeout(function () { document.getElementById("snackbar").className = document.getElementById("snackbar").className.replace("show", ""); }, 3000);


                                    $(`#decline-request-user-${request["schedule_id"]}`).replaceWith("<div class=\"declined-2\" id=\"declined-2\">Declined</div>");
                                    $(`#approve-request-user-${request["schedule_id"]}`).replaceWith("<div class=\"approve-2\" id=\"approve-2\">Approve</div>");
                                });
                            });
                        }
                    });
                });

                $('#sent-tab').trigger('click');
            });

            $('#profile-menu-posts').on('click', () => {

                $('#profile-display').html("<div class=\"profile-subheader\">Post History</div>");

                $('#profile-display').append("<div class=\"grid-display-bar-userposts\" id=\"display-bar\"><div class=\"search-schedule-item\">Show</div><select name=\"max_userposts\" id=\"max_userposts\" onchange=\"get_userposts()\"></select></div>");
                $('#max_userposts').append("<option value=\"10\">10</option>" +
                    "<option value=\"20\" selected>20</option>" +
                    "<option value=\"50\">50</option>" +
                    "<option value=\"100\">100</option>");

                $('#profile-display').append("<div class=\"grid-profile-schedules\" id=\"profile-posts\"></div>")
                $('#profile-display').append("<div class=\"display-page-num\" id=\"display-page-num-posts\"></div>");

                curr_userpost_page_set = 1;
                curr_userpost_page_num = 1;
                get_userposts();
            });
        }
    });
});

function get_userschedules_created() {

    $.get('/user-schedules-created', {"limit_size": $('#max_userschedules').val(), "offset_page": curr_userpost_page_num - 1}, (schedules) => {

        $('#user-post-canvas').html('');

        if (schedules[0].length == 0) {

            $('#user-post-canvas').append("<div class=\"error-page\">No schedules yet.</div>");
        }
        else {

            for (const schedule of schedules[0]) {

                $('#user-post-canvas').append(`<div class=\"grid-profile-schedule-item\" id=\"profile-schedule-${schedule["schedule_id"]}\"></div>`);
                $(`#profile-schedule-${schedule["schedule_id"]}`).append(get_userschedule_html(schedule));

                $(`#profile-schedule-${schedule["schedule_id"]}`).append(`<div class=\"grid-user-schedule-hover\" id=\"user-schedule-hover-${schedule["schedule_id"]}\"></div>`);
                $(`#user-schedule-hover-${schedule["schedule_id"]}`).html(`<div class=\"view-schedule-button-2\" id=\"view-schedule-user-${schedule["schedule_id"]}\">View</div><div></div>`);
                $(`#user-schedule-hover-${schedule["schedule_id"]}`).append(`<div></div><div class=\"archive-schedule-button\" id=\"archive-schedule-user-${schedule["schedule_id"]}\">Archive</div><div></div>`);
                $(`#user-schedule-hover-${schedule["schedule_id"]}`).append(`<div class=\"delete-schedule-button\" id=\"delete-schedule-user-${schedule["schedule_id"]}\">Delete</div><div></div>`);

                $(`#view-schedule-user-${schedule["schedule_id"]}`).on('click', () => {

                    view_schedule(`${schedule["schedule_id"]}`);
                });

                $(`#archive-schedule-user-${schedule["schedule_id"]}`).on('click', () => {

                    $.post(`/archive-schedule/${schedule.schedule_id}`, (msg) => {

                        $(`#view-schedule-user-${schedule["schedule_id"]}`).remove();
                        $(`#archive-schedule-user-${schedule["schedule_id"]}`).remove();
                        $(`#delete-schedule-user-${schedule["schedule_id"]}`).remove();
                        $(`#user-schedule-hover-${schedule["schedule_id"]}`).append(`<div class=\"subheader-2\" id=\"subheader-${schedule["schedule_id"]}\">Sent to Archived</div>`);
                        $(`#user-schedule-hover-${schedule["schedule_id"]}`).css('background-color', 'rgba(255, 255, 255, 0.8)');
                        $(`#user-schedule-hover-${schedule["schedule_id"]}`).css('opacity', '1');
                    });
                });

                $(`#delete-schedule-user-${schedule["schedule_id"]}`).on('click', () => {

                    $.post(`/delete-schedule/${schedule["schedule_id"]}`, (msg) => {

                        $(`#view-schedule-user-${schedule["schedule_id"]}`).remove();
                        $(`#archive-schedule-user-${schedule["schedule_id"]}`).remove();
                        $(`#delete-schedule-user-${schedule["schedule_id"]}`).remove();
                        $(`#user-schedule-hover-${schedule["schedule_id"]}`).append(`<div class=\"subheader-2\" id=\"subheader-${schedule["schedule_id"]}\">${msg}</div>`);
                        $(`#user-schedule-hover-${schedule["schedule_id"]}`).css('background-color', 'rgba(255, 255, 255, 0.8)');
                        $(`#user-schedule-hover-${schedule["schedule_id"]}`).css('opacity', '1');
                    })
                });
            }
        }

        //generate paginatiom
        $('#display-page-num').html("<div class=\"grid-num-pages\" id=\"num-pages-posts\"></div>")
        const MAX_ITEM_PER_PAGE = $('#max_userschedules').val();
        const total_pages = Math.ceil(schedules[1].query_count / MAX_ITEM_PER_PAGE);
        const total_page_sets = Math.ceil(total_pages / MAX_PAGE_NUM_PER_SET);
        let num_pages = total_pages;

        if (total_pages > MAX_PAGE_NUM_PER_SET) {

            num_pages = MAX_PAGE_NUM_PER_SET;
        }

        //checks if last set of pages
        if (curr_schedule_search_page_set == total_page_sets) {

            num_pages = total_pages - (MAX_PAGE_NUM_PER_SET * (curr_userpost_page_set - 1));
        }

        if (curr_userpost_page_set != 1) {

            $('#num-pages-posts').append(`<div class=\"triangle-left\" id=\"prev-page-set-${curr_userpost_page_set}\"></div>`);

            $(`#prev-page-set-${curr_userpost_page_set}`).on('click', () => {

                curr_userpost_page_set -= 1;
                curr_userpost_page_num = MAX_PAGE_NUM_PER_SET * (curr_userpost_page_set - 1) + 1;
                get_userschedules_created();
            });
        }

        for (let i = 1; i <= num_pages; i++) {

            const offset = MAX_PAGE_NUM_PER_SET * (curr_userpost_page_set - 1);

            $('#num-pages-posts').append(`<div class=\"page-num\" id=\"page-num-${offset + i}\">${offset + i}</div>`);

            $(`#page-num-${offset + i}`).on('click', () => {

                curr_userpost_page_num = offset + i;
                get_userschedules_created();
            });

            if (curr_userpost_page_num === offset + i) {

                $(`#page-num-${offset + i}`).addClass("page-num-selected");
            }
            else {
                $(`#page-num-${offset + i}`).removeClass("page-num-selected");
            }
        }

        if (curr_userpost_page_set < total_page_sets) {

            $('#num-pages-posts').append(`<div class=\"triangle-right\" id=\"next-page-set-${curr_userpost_page_set}\"></div>`);

            $(`#next-page-set-${curr_userpost_page_set}`).on('click', () => {

                curr_post_page_set += 1;
                curr_post_page_num = MAX_PAGE_NUM_PER_SET * (curr_userpost_page_set - 1) + 1;
                get_userschedules_created();
            });
        }
    });
}

function get_userschedules_joined() {

    $.get('/user-schedules-joined', {"limit_size": $('#max_userschedules_joined').val(), "offset_page": curr_userpost_page_num - 1}, (schedules) => {

        $('#user-post-joined-canvas').html('');

        if (schedules[0].length == 0) {

            $('#user-post-joined-canvas').append("<div class=\"error-page\">No schedules yet.</div>");
        }
        else {

            for (const schedule of schedules[0]) {

                $('#user-post-joined-canvas').append(`<div class=\"grid-profile-schedule-item\" id=\"profile-schedule-${schedule["schedule_id"]}\"></div>`);
                $(`#profile-schedule-${schedule["schedule_id"]}`).append(get_userschedule_html(schedule));


                $(`#profile-schedule-${schedule["schedule_id"]}`).append(`<div class=\"grid-user-schedule-hover\" id=\"user-joined-schedule-hover-${schedule["schedule_id"]}\"></div>`);
                $(`#user-joined-schedule-hover-${schedule["schedule_id"]}`).html(`<div class=\"view-schedule-button-2\" id=\"view-schedule-user-${schedule["schedule_id"]}\">View</div><div></div>`);
                $(`#user-joined-schedule-hover-${schedule["schedule_id"]}`).append(`<div class=\"leave-schedule-button\" id=\"leave-button-${schedule["schedule_id"]}\">Leave Schedule</div>`);

                $(`#view-schedule-user-${schedule["schedule_id"]}`).on('click', () => {

                    view_schedule(`${schedule["schedule_id"]}`);
                });

                $(`#leave-button-${schedule["schedule_id"]}`).on('click', () => {

                    $.post(`/leave-schedule/${schedule["schedule_id"]}`, (msg) => {

                        $(`#view-schedule-user-${schedule["schedule_id"]}`).remove();
                        $(`#leave-button-${schedule["schedule_id"]}`).remove();
                        $(`#user-request-sent-hover-${schedule["schedule_id"]}`).append(`<div class=\"subheader-2\" id=\"subheader-${schedule["schedule_id"]}\">${msg}</div>`);
                        $(`#user-request-sent-hover-${schedule["schedule_id"]}`).css('background-color', 'rgba(255, 255, 255, 0.8)');
                        $(`#user-request-sent-hover-${schedule["schedule_id"]}`).css('opacity', '1');
                    });
                });
            }
        }

        //generate paginatiom
        $('#display-page-num-joined').html("<div class=\"grid-num-pages\" id=\"num-pages-schedules-joined\"></div>")
        const MAX_ITEM_PER_PAGE = $('#max_userschedules_joined').val();
        const total_pages = Math.ceil(schedules[1].query_count / MAX_ITEM_PER_PAGE);
        const total_page_sets = Math.ceil(total_pages / MAX_PAGE_NUM_PER_SET);
        let num_pages = total_pages;

        if (total_pages > MAX_PAGE_NUM_PER_SET) {

            num_pages = MAX_PAGE_NUM_PER_SET;
        }

        //checks if last set of pages
        if (curr_schedule_search_page_set == total_page_sets) {

            num_pages = total_pages - (MAX_PAGE_NUM_PER_SET * (curr_userpost_page_set - 1));
        }

        if (curr_userpost_page_set != 1) {

            $('#num-pages-schedules-joined').append(`<div class=\"triangle-left\" id=\"prev-page-set-${curr_userpost_page_set}\"></div>`);

            $(`#prev-page-set-${curr_userpost_page_set}`).on('click', () => {

                curr_userpost_page_set -= 1;
                curr_userpost_page_num = MAX_PAGE_NUM_PER_SET * (curr_userpost_page_set - 1) + 1;
                get_userschedules_joined();
            });
        }

        for (let i = 1; i <= num_pages; i++) {

            const offset = MAX_PAGE_NUM_PER_SET * (curr_userpost_page_set - 1);

            $('#num-pages-schedules-joined').append(`<div class=\"page-num\" id=\"page-num-joined-${offset + i}\">${offset + i}</div>`);

            $(`#page-num-joined-${offset + i}`).on('click', () => {

                curr_userpost_page_num = offset + i;
                get_userschedules_joined();
            });

            if (curr_userpost_page_num === offset + i) {

                $(`#page-num-joined-${offset + i}`).addClass("page-num-selected");
            }
            else {
                $(`#page-num-joined-${offset + i}`).removeClass("page-num-selected");
            }
        }

        if (curr_userpost_page_set < total_page_sets) {

            $('#num-pages-schedules-joined').append(`<div class=\"triangle-right\" id=\"next-page-set-${curr_userpost_page_set}\"></div>`);

            $(`#next-page-set-${curr_userpost_page_set}`).on('click', () => {

                curr_userpost_page_set += 1;
                curr_userpost_page_num = MAX_PAGE_NUM_PER_SET * (curr_userpost_page_set - 1) + 1;
                get_userschedules_joined();
            });
        }
    });
}

function get_userschedules_archived() {

    $.get('/user-schedules-archived', {"limit_size": $('#max_userschedules_archived').val(), "offset_page": curr_userpost_page_num - 1}, (schedules) => {

        $('#user-post-archived-canvas').html('');

        if (schedules[0].length == 0) {

            $('#user-post-archived-canvas').append("<div class=\"error-page\">No schedules yet.</div>");
        }
        else {

            for (const schedule of schedules[0]) {

                $('#user-post-archived-canvas').append(`<div class=\"grid-profile-schedule-item\" id=\"profile-archived-${schedule["schedule_id"]}\"></div>`);
                $(`#profile-archived-${schedule["schedule_id"]}`).append(get_userschedule_html(schedule));

                $(`#profile-archived-${schedule["schedule_id"]}`).append(`<div class=\"grid-user-schedule-hover\" id=\"user-joined-schedule-hover-${schedule["schedule_id"]}\"></div>`);
                $(`#user-joined-schedule-hover-${schedule["schedule_id"]}`).html(`<div class=\"view-schedule-button-5\" id=\"view-schedule-user-${schedule["schedule_id"]}\">View Schedule</div>`);

                $(`#view-schedule-user-${schedule["schedule_id"]}`).on('click', () => {

                    view_schedule(`${schedule["schedule_id"]}`);
                });
            }
        }

        //generate paginatiom
        $('#display-page-num-archived').html("<div class=\"grid-num-pages\" id=\"num-pages-schedules-archived\"></div>")
        const MAX_ITEM_PER_PAGE = $('#max_userschedules_archived').val();
        const total_pages = Math.ceil(schedules[1].query_count / MAX_ITEM_PER_PAGE);
        const total_page_sets = Math.ceil(total_pages / MAX_PAGE_NUM_PER_SET);
        let num_pages = total_pages;

        if (total_pages > MAX_PAGE_NUM_PER_SET) {

            num_pages = MAX_PAGE_NUM_PER_SET;
        }

        //checks if last set of pages
        if (curr_schedule_search_page_set == total_page_sets) {

            num_pages = total_pages - (MAX_PAGE_NUM_PER_SET * (curr_userpost_page_set - 1));
        }

        if (curr_userpost_page_set != 1) {

            $('#num-pages-schedules-archived').append(`<div class=\"triangle-left\" id=\"prev-page-set-${curr_userpost_page_set}\"></div>`);

            $(`#prev-page-set-${curr_userpost_page_set}`).on('click', () => {

                curr_userpost_page_set -= 1;
                curr_userpost_page_num = MAX_PAGE_NUM_PER_SET * (curr_userpost_page_set - 1) + 1;
                get_userschedules_archived();
            });
        }

        for (let i = 1; i <= num_pages; i++) {

            const offset = MAX_PAGE_NUM_PER_SET * (curr_userpost_page_set - 1);

            $('#num-pages-schedules-archived').append(`<div class=\"page-num\" id=\"page-num-archived-${offset + i}\">${offset + i}</div>`);

            $(`#page-num-archived-${offset + i}`).on('click', () => {

                curr_userpost_page_num = offset + i;
                get_userschedules_archived();
            });

            if (curr_userpost_page_num === offset + i) {

                $(`#page-num-archived-${offset + i}`).addClass("page-num-selected");
            }
            else {
                $(`#page-num-archived-${offset + i}`).removeClass("page-num-selected");
            }
        }

        if (curr_userpost_page_set < total_page_sets) {

            $('#num-pages-schedules-archived').append(`<div class=\"triangle-right\" id=\"next-page-set-${curr_userpost_page_set}\"></div>`);

            $(`#next-page-set-${curr_userpost_page_set}`).on('click', () => {

                curr_userpost_page_set += 1;
                curr_userpost_page_num = MAX_PAGE_NUM_PER_SET * (curr_userpost_page_set - 1) + 1;
                get_userschedules_archived();
            });
        }
    });
}

function get_userposts() {

    $.get('/user-posts', {"limit_size": $('#max_userposts').val(), "offset_page": curr_userpost_page_num - 1}, (posts) => {

        $('#profile-posts').html('');

        if (posts[0].length == 0) {

            $('#profile-posts').append("<div class=\"error-page\">No posts yet.</div>");
        }
        else {

            for (const post of posts[0]) {

                $('#profile-posts').append(`<div class=\"grid-profile-schedule-item\" id=\"profile-post-${post["post_id"]}\"></div>`);
                $(`#profile-post-${post["post_id"]}`).append(get_userpost_html(post));
            }

            //generate paginatiom
            $('#display-page-num-posts').html("<div class=\"grid-num-pages\" id=\"num-pages-userposts\"></div>")
            const MAX_ITEM_PER_PAGE = $('#max_userposts').val();
            const total_pages = Math.ceil(posts[1].query_count / MAX_ITEM_PER_PAGE);
            const total_page_sets = Math.ceil(total_pages / MAX_PAGE_NUM_PER_SET);
            let num_pages = total_pages;

            if (total_pages > MAX_PAGE_NUM_PER_SET) {

                num_pages = MAX_PAGE_NUM_PER_SET;
            }

            //checks if last set of pages
            if (curr_schedule_search_page_set == total_page_sets) {

                num_pages = total_pages - (MAX_PAGE_NUM_PER_SET * (curr_userpost_page_set - 1));
            }

            if (curr_userpost_page_set != 1) {

                $('#num-pages-userposts').append(`<div class=\"triangle-left\" id=\"prev-page-set-${curr_userpost_page_set}\"></div>`);

                $(`#prev-page-set-${curr_userpost_page_set}`).on('click', () => {

                    curr_userpost_page_set -= 1;
                    curr_userpost_page_num = MAX_PAGE_NUM_PER_SET * (curr_userpost_page_set - 1) + 1;
                    get_userposts();
                });
            }

            for (let i = 1; i <= num_pages; i++) {

                const offset = MAX_PAGE_NUM_PER_SET * (curr_userpost_page_set - 1);

                $('#num-pages-userposts').append(`<div class=\"page-num\" id=\"page-num-userposts-${offset + i}\">${offset + i}</div>`);

                $(`#page-num-userposts-${offset + i}`).on('click', () => {

                    curr_userpost_page_num = offset + i;
                    get_userposts();
                });

                if (curr_userpost_page_num === offset + i) {

                    $(`#page-num-userposts-${offset + i}`).addClass("page-num-selected");
                }
                else {
                    $(`#page-num-userposts-${offset + i}`).removeClass("page-num-selected");
                }
            }

            if (curr_userpost_page_set < total_page_sets) {

                $('#num-pages-userposts').append(`<div class=\"triangle-right\" id=\"next-page-set-${curr_userpost_page_set}\"></div>`);

                $(`#next-page-set-${curr_userpost_page_set}`).on('click', () => {

                    curr_userpost_page_set += 1;
                    curr_userpost_page_num = MAX_PAGE_NUM_PER_SET * (curr_userpost_page_set - 1) + 1;
                    get_userposts();
                });
            }
        }
    });
}
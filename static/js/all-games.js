"use-strict";

const MAX_ITEM_PER_PAGE_ALLGAMES = 20;
let curr_allgames_page_num = 1;
let max_pages = 1;

$('#all-games').on('click', () => {

    curr_allgames_page_num = 1;

    $('#homepage-display').html("<div class=\"subheader\" id=\"subheader\">All Games</div>");
    $('#homepage-display').append("<form class=\"display-search-game-bar\" method=\"GET\" id=\"search-game-bar\"></form>");
    $('#search-game-bar').append("<div class=\"search-schedule-item\">Search Database</div><input onkeyup=\"onKeyUp_searchGames_db()\" onkeydown=\"return (event.keyCode != 13);\"/ type=\"text\" name=\"game-name\" id=\"game-name\"></input>");
    $('#search-game-bar').append("<div></div><div class=\"search-schedule-item\">Sort by</div>");
    $('#search-game-bar').append("<select name=\"sort-by\" id=\"sort-by\" onchange=\"onKeyUp_searchGames_db()\">" + 
                                "<option value=\"alphabetical\">Alphabetical</option>" +
                                "<option value=\"most-active\">Most Popular</option></select>");

    $('#homepage-display').append("<div class=\"arrow-left\" id=\"arrow-left\"></div>");
    $('#homepage-display').append("<div class=\"display-games\"></div>");
    $('.display-games').append("<div class=\"grid-display-games\" id=\"display-games\"></div>");
    $('#homepage-display').append(`<div class=\"page-indicator-bar\" id=\"page-indicator\"></div>`);
    $('#homepage-display').append("<div class=\"arrow-right\" id=\"arrow-right\"></div>");

    $('#arrow-left').on('click', () => {

        curr_allgames_page_num -= 1;

        if(curr_allgames_page_num < 1){
            curr_allgames_page_num = max_pages;
        }

        get_games();
    });

    $('#arrow-right').on('click', () => {

        curr_allgames_page_num += 1;

        if (curr_allgames_page_num > max_pages) {
            curr_allgames_page_num = 1;
        }

        get_games();
    });

    get_games();
});

function onKeyUp_searchGames_db() {

    curr_allgames_page_num = 1;
    max_pages = 1;

    if (game_search_Flag) {

        clearTimeout(game_search_Handler);
        game_search_Handler = window.setTimeout(get_games, game_search_timer);
        game_search_Flag = false;
    }
    else {

        game_search_Flag = true;
        game_search_Handler = window.setTimeout(get_games, game_search_timer);
    }
}

function get_games() {

    const formData = $('#search-game-bar').serialize() + "&limit_size=" + MAX_ITEM_PER_PAGE_ALLGAMES + "&offset_page=" + (curr_allgames_page_num - 1);
    $('#display-games').html('');

    $.get('/get-games', formData, (games) => {

        max_pages = Math.ceil(games[1].query_count/MAX_ITEM_PER_PAGE_ALLGAMES);

        for (const game of games[0]) {
            
            name = game.name.charAt(0).toUpperCase() + game.name.slice(1);
            $('#display-games').append(`<div class=\"grid-display-game-item-hover\" id=\"display-game-item-${game.game_id}\"></div>`);
            $(`#display-game-item-${game.game_id}`).append(`<img class=\"display-game-item-img\" id=\"display-game-item-img-${game.game_id}\" src=\"${game.icon_path}\"></div>` +
                `<div class=\"display-game-item-name\" id=\"display-game-item-name-${game.game_id}\"></div>`);
            $(`#display-game-item-name-${game.game_id}`).append(`${game.name}`);
            $(`#display-game-item-${game.game_id}`).append(`<div class=\"create-schedule-hover\" id=\"create-schedule-${game.game_id}\">Create Schedule</div>`);
        }

        $('.create-schedule-hover').on('click', (evt) => {

            const game_id = evt.target.id.slice(16);
            
            $.post(`/create-schedule-from-gamedb/${game_id}`, (game) => {

                if (game === "None") {

                    $('#homepage-display').html("<div class=\"error-page\" id=\"error-page\">Error: Game Not Found</div>");
                }
                else {
                    
                    fromSearch = false;
                    createSchedule_by_game_id(game_id);
                }
            });
        });

        pageload_percentage = curr_allgames_page_num / max_pages * 100;

        $('#page-indicator').html(`<span class=\"all-games-page-num\" id=\"all-games-page-num\"></span>`);
        $('#page-indicator').append(`<div class=\"loading-bar\" id=\"loading-indicator\"></div>`);

        $('#all-games-page-num').html(`(${curr_allgames_page_num}/${max_pages})`);
        $('#loading-indicator').css("width", `${pageload_percentage}%`);
    });
}
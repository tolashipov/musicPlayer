var playbar = (function (M) {

    var $msgbg = $(`#editbg`);
    var $msgbox = $(`#editbg > #msgbox`);
    var $playDisc = $(`.navbar>.playBarCtr>.playBar>.playDisc`);
    var $playBarCtr = $(`.navbar>.playBarCtr`);
    var $audio = $(`.navbar>.playBarCtr>.playBar>audio`);
    var $thePlayList = $(`.navbar>.playBarCtr>.playBar>#thePlayList`);
    var $delete = $(`.navbar>.playBarCtr>.playBar>.fa-times`);
    var $edit = $(`.navbar>.playBarCtr>.playBar>.fa-pen-square`);
    var $playPause = $(`.navbar>.playBarCtr>.playBar>.playDisc>.far`);

    // playing a playlist
    var loadAlbum = function (id) {
        // call OUTER api function that gives all the playlist information
        $.ajax({
            url: 'http://localhost/playlist/api/playlist/' + id,
            method: 'get',
            dataType: 'json'
        }).done(function (ret) {
            $playDisc.css('background-image', 'url(' + ret["data"]["image"] + ')');
            $delete.off('click');
            $edit.off('click');
            $delete.data("id", id);
            $edit.data("id", id);
            buttonSet(id);
            loadSongs(id, ret["data"]["name"]);
        }).fail(function (x, msg) {
            console.log('error:', msg);
        });
    }

    var loadSongs = function (id, albumName) {
        $.ajax({
            url: 'http://localhost/playlist/api/playlist/' + id + '/songs',
            method: 'get',
            dataType: 'json'
        }).done(function (ret) {
            $audio.attr('autoplay', true);
            $audio.attr('src', ret["data"]["songs"][0]["url"]).on('ended', function () {
                playNewSong(1, ret["data"]["songs"]);
            });
            doLoadSongs(ret["data"]["songs"], albumName);
            console.log('loading songs');
        }).fail(function (x, msg) {
            console.log('error:', msg);
        });
    }

    var doLoadSongs = function (songs, albumName) {
        $thePlayList.empty();
        for (i = 0; i < songs.length; i++) {
            var $song = $(`<li data-id=${i} id="lisong${i}"><span class="beforeli"></span>${songs[i]["name"]}</li>`).appendTo($thePlayList).on('click', function () {
                playNewSong($(this).data("id"), songs, albumName);
            });
        }
        $(`#lisong0`).addClass('songBeingPlayed');
        $(document).attr('title', albumName+': '+ songs[0]["name"]);
    }

    var playNewSong = function (id, songs, albumName) {
        // console.log(id);
        $(`.navbar>.playBarCtr>.playBar>#thePlayList>li`).removeClass('songBeingPlayed');
        $(`#lisong${id}`).addClass('songBeingPlayed');
        $(document).attr('title', albumName+': '+ songs[id]["name"]);
        if (!$audio.attr('autoplay')) {
            $audio.attr('autoplay', true);
        }
        if (songs[id + 1]) {
            $audio.attr('src', songs[id]["url"]).on('ended', function () {
                playNewSong(id + 1, songs);
            });
        } else {
            $audio.attr('src', songs[id]["url"]).off('ended', function () {
                playNewSong(id, songs);
            });
            $audio.attr('src', songs[id]["url"]).off('ended', function () {
                playNewSong(id + 1, songs);
            });
            $audio.on('ended', function () {
                $audio.removeAttr('autoplay');
            });

        }
    }

    var buttonSet = function (id) {
        $delete.on('click', (x) => {
            //show "are you sure?" page
            $msgbg.show();
            $msgbox.show();
            $msgbox.append(`<h3>are you sure? all info will be lost</h3>`);
            $(`<button class="btn btn-danger">yes</button>`).appendTo($msgbox).on('click', (x) => {
                M.deleteAlbum($delete.data("id"));
                location.reload();
            });
            $(`<button class="btn btn-success">dont delete the album please</button>`).appendTo($msgbox).on('click', (x) => {
                $msgbg.hide();
                $msgbox.hide();
                $(`#msgbox>h3`).remove();
                $(`#msgbox>.btn`).remove();
            });
        });
        $edit.on('click', (x) => {
            showEditAlbum($edit.data("id"), 1);
        });
    }

    $playPause.on('click', function () {
        // play or pause music
        if ($audio[0]["paused"]) {
            $audio[0].play();
        } else {
            $audio[0].pause();
        }
    });

    $audio.on('pause', function () {
        if ($playPause.hasClass("rev-rotate")) {
            $playPause.toggleClass("fa-play-circle");
            $playPause.toggleClass("fa-pause-circle");
            $playPause.toggleClass("rev-rotate");
            $playDisc.toggleClass("rotate");
        }
    });

    $audio.on('play', function () {
        if (!$playPause.hasClass("rev-rotate")) {
            $playPause.toggleClass("fa-play-circle");
            $playPause.toggleClass("fa-pause-circle");
            $playPause.toggleClass("rev-rotate");
            $playDisc.toggleClass("rotate");
        }
    });




    return {
        loadAlbum: loadAlbum,
        loadSongs: loadSongs
    }
});
var play = (function () {

    var $addPlaylist = $(`.navbar>#addButton`);
    var $msgbg = $(`#editbg`);
    var $editPage = $(`#editbg > #editctr`);
    var $addSongsMenu = $(`#editbg > #editctr2`);
    var $addSongBtn = $(`#editbg > #editctr2>form>#addSong`);
    var $nextBtn = $(`#editbg>div>form>.next`);
    var $resetBtn = $(`#editbg>div>form>.reset`);
    var $submitBtn = $(`#editbg>div>form>.submit`);
    var $songsForm = $(`#editbg > #editctr2>form`);
    var $albumName = $(`#editbg > #editctr>form>input:nth-of-type(1)`);
    var $imgURL = $(`#editbg > #editctr>form>input:nth-of-type(2)`);
    var $sortable = $(`#editbg > #editctr2>form>#sortable`);
    var $songURL = $(`#editbg > #editctr2>form input:nth-of-type(odd)`);
    var $trash = $(`#editctr2>form>#sortable>li>.fa-trash`);
    var $msgbox = $(`#editbg > #msgbox`);
    var M = new model();
    var PB = new playbar(M);
    var PL = new playlist(PB, M);
    // M.randomUserAPI();
    PL.init();

    //  showing edit/add playlist page on click
    $addPlaylist.on('click', function () {
        $msgbg.show();
        $editPage.show();
        $imgURL.on('input', function () {
            if (validate($imgURL.val(), "image")) {
                $(`#prev-image`).css('background-image', 'url(' + $imgURL.val() + ')');
            }
        });
        $submitBtn.on('click', (x) => {
            submitForm();
        });
    });

    var nextEdit = function () {
        if ($albumName.val() != '') {
            $albumName.removeClass("noinput");
            if (validate($imgURL.val(), "image")) {
                $imgURL.removeClass("noinput");
                $editPage.hide();
                $addSongsMenu.show();
                // console.log('image validated :)');
            } else {
                $imgURL.addClass("noinput");
                // console.log($imgURL.val(), 'image validation failed');
            }
        } else {
            $albumName.addClass("noinput");
        }
    }
    // going to next edit/add page
    $nextBtn.on('click', (x)=>{nextEdit()});

    // resetting fields
    $resetBtn.on('click', function () {
        $(`#editbg>#editctr>form>input`).val('');
    });

    // delete song line
    $trash.on('click', function () {
        // console.log($(this)[0]["parentElement"]["parentElement"]["childElementCount"]);
        removeSongLine($(this));
    });

    // exit add/edit mode on 'esc' press
    $(document).keyup(function (e) {
        if (e.keyCode == 27) {
            $editPage.hide();
            $addSongsMenu.hide();
            if (!$msgbox.is(':visible')) {
                $msgbox.append(`<h3>are you sure? all info will be lost</h3>`);
                $msgbox.show();
                $(`<button class="btn btn-danger">yes</button>`).appendTo($msgbox).on('click', (x) => {
                    $msgbox.hide();
                    $msgbg.hide();
                    $(`#editbg>#editctr>form>input`).val('');
                    $(`#editbg>#editctr2>form input`).val('');
                    $(`#prev-image`).css('background-image', '');
                    $imgURL.removeClass("noinput");
                    $albumName.removeClass("noinput");
                    $(`#msgbox>h3`).remove();
                    $(`#msgbox>.btn`).remove();
                });
                $(`<button class="btn btn-warning">oops, keep me here</button>`).appendTo($msgbox).on('click', (x) => {
                    $msgbox.hide();
                    $editPage.show();
                    $imgURL.removeClass("noinput");
                    $albumName.removeClass("noinput");
                    $(`#msgbox>h3`).remove();
                    $(`#msgbox>.btn`).remove();
                });
                $(`<button class="btn btn-success">leave, but keep info</button>`).appendTo($msgbox).on('click', (x) => {
                    $msgbg.hide();
                    $msgbox.hide();
                    $(`#msgbox>h3`).remove();
                    $(`#msgbox>.btn`).remove();
                });
                $submitBtn.off('click');
            }
        }
    });

    $addSongBtn.on('click', function () {
        var id = Date.now();
        $sortable.append(`<li class="ui-state-default">
        <span>Song URL:</span>
        <input class="form-control" name="url" type="url">
        <span>Name:</span>
        <input class="form-control" name="name" type="text">
        <i id="${id}" class="fas fa-trash"></i>
      </li>`);
        $(`#${id}`).on('click', (x) => {
            removeSongLine($(`#${id}`));
        });
    });

    var removeSongLine = function (data) {
        if (data[0]["parentElement"]["parentElement"]["childElementCount"] > 1) {
            data[0]["parentElement"].remove();
        }
    }

    var postPlaylist = function (data) {
        $.ajax({
            url: 'http://localhost/playlist/api/playlist',
            data: data,
            method: 'post',
            dataType: 'json'
        }).done(function (ret) {
            console.log('success', ret);
            PL.init();
            $(`#editbg>#editctr>form>input`).val('');
            $(`#editbg>#editctr2>form>input`).val('');
            $(`#prev-image`).css('background-image', '');
            $imgURL.removeClass("noinput");
            $albumName.removeClass("noinput");
        }).fail(function (x, msg) {
            console.log('error:', msg);
        });
    };

    var deleteAlbum = function (id) {
        // console.log(id);
        $.ajax({
            url: 'http://localhost/playlist/api/playlist/' + id,
            method: 'delete',
            dataType: 'json'
        }).done(function () {
            console.log(id, 'deleted');
            PL.init();
        }).fail(function (x, msg) {
            console.log('error:', msg)
        });
    }
    var editPlaylistDetails = function (id, name, image) {
        $nextBtn.off('click');
        $nextBtn.on('click', (x)=>{nextEdit()});
        var newData = {};
        newData["name"] = name;
        newData["image"] = image;
        $.ajax({
            url: 'http://localhost/playlist/api/playlist/' + id,
            data: newData,
            method: 'post',
            dataType: 'json'
        }).done(function (ret) {
            console.log('success', ret);
        }).fail(function (x, msg) {
            console.log('error:', msg);
        });
    }
    var editPlaylistSongs = function (data, id) {
        var songs = {};
        songs["songs"] = data["songs"];
        $.ajax({
            url: 'http://localhost/playlist/api/playlist/' + id + '/songs',
            data: songs,
            method: 'post',
            dataType: 'json'
        }).done(function (ret) {
            console.log('success', ret);
            PL.init();
        }).fail(function (x, msg) {
            console.log('error:', msg);
        });
    };

    // submitting the playlist
    var submitForm = function (id = null) {
        if (validate($(`#editbg > #editctr2>form input:nth-of-type(odd)`).val(), "mp3")) {
            console.log('song validated :)');
            var formData = {
                name: "",
                image: "",
                songs: []
            };
            var songData = $songsForm.serializeArray();
            formData["name"] = $(`#editbg > #editctr>form>input:nth-of-type(1)`).val();
            formData["image"] = $imgURL.val();
            for (i = 0; i < songData.length / 2; i++) {
                try {
                    throw i
                } catch (ii) {
                    setTimeout(function () {
                        var song = {
                            name: "",
                            url: ""
                        };
                        song.url = songData[ii * 2]["value"];
                        song.name = songData[ii * 2 + 1]["value"];
                        formData["songs"][ii] = song;
                    }, 1000);
                }
            }
            //     CALL API FUNCTION TO SEND DATA
            if (!id) {
                setTimeout(function () {
                    postPlaylist(formData);
                }, 1000);
            } else {
                setTimeout(function () {
                    editPlaylistSongs(formData, id);
                }, 1000);
            }
            $(`#editbg>#editctr>form>input`).val('');
            $(`#editbg>#editctr2>form>input`).val('');
            $(`#prev-image`).css('background-image', '');
            $imgURL.removeClass("noinput");
            $albumName.removeClass("noinput");
            $msgbg.hide();
            $addSongsMenu.hide();
        } else {
            console.log($(`#editbg > #editctr2>form input:nth-of-type(odd)`).val(), 'song validation failed');
            $songURL.addClass("noinput");
        }
        $submitBtn.off('click');
    }

    showEditAlbum = function (id, playerEdit = null) {
        $submitBtn.on('click', (x) => {
            submitForm(id);
            if (playerEdit) {
                setTimeout(function () {
                    console.log(id);
                    PB.loadSongs(id);
                }, 3000);
            }
        });
        $.ajax({
            url: 'http://localhost/playlist/api/playlist/' + id,
            method: 'get',
            dataType: 'json'
        }).done(function (ret) {
            $msgbg.show();
            $editPage.show();
            $albumName.val(ret["data"]["name"]);
            $imgURL.val(ret["data"]["image"]);
            if (validate($imgURL.val(), "image")) {
                $(`#prev-image`).css('background-image', 'url(' + $imgURL.val() + ')');
            }
            $nextBtn.on('click', (x) => {
                editPlaylistDetails(id, $albumName.val(), $imgURL.val());
            });
            showEditSongs(id);
        }).fail(function (x, msg) {
            console.log('error:', msg);
        });
    }

    showEditSongs = function (id) {
        $.ajax({
            url: 'http://localhost/playlist/api/playlist/' + id + '/songs',
            method: 'get',
            dataType: 'json'
        }).done(function (ret) {
            $sortable.empty();
            for (i = 0; i < ret["data"]["songs"].length; i++) {
                addSongLine();
                $(`#editbg > #editctr2>form>#sortable>li:nth-child(${i+1})>input:nth-of-type(1)`).val(ret["data"]["songs"][i]["url"]);
                $(`#editbg > #editctr2>form>#sortable>li:nth-child(${i+1})>input:nth-of-type(2)`).val(ret["data"]["songs"][i]["name"]);
            }
        }).fail(function (x, msg) {
            console.log('error:', msg);
        });
    }

    var addSongLine = function () {
        var id = Date.now() * Math.floor(Math.random() * 100);
        $sortable.append(`<li class="ui-state-default">
        <span>Song URL:</span>
        <input class="form-control" name="url" type="url">
        <span>Name:</span>
        <input class="form-control" name="name" type="text">
        <i id="${id}" class="fas fa-trash"></i>
      </li>`);
        $(`#${id}`).on('click', (x) => {
            removeSongLine($(`#${id}`));
        });
    }

    // regular expression validation for MP3 and image files
    var validate = function (filename, filetype) {
        switch (filetype) {
            case "mp3":
                if (!(/\.(mp3)$/i).test(filename)) {
                    return (false);
                } else {
                    return (true);
                }
                break;
            case "image":
                if (!(/\.(jpg|jpeg|png)$/i).test(filename)) {
                    return (false);
                } else {
                    return (true);
                }
                break;
        }

    }

})();
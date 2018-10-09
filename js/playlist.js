var playlist = (function (PB, M) {

    var $msgbg = $(`#editbg`);
    var $editPage = $(`#editbg > #editctr`);
    // var $addSongsMenu = $(`#editbg > #editctr2`);
    var $playBarCtr = $(`.navbar>.playBarCtr`);
    var $page = $(`.page`);
    var $discName = $('.page > .discctr > .discName');
    var $msgbox = $(`#editbg > #msgbox`);
    var $search = $(`.navbar>#searchBar>input`);

    var init = function () {
        // call API function to load the discs with all the information
        $.ajax({
            url: 'http://localhost/playlist/api/playlist',
            method: 'get',
            dataType: 'json'
        }).done(function (allPlaylists) {
            dumpToView(allPlaylists);
        }).fail(function (x, msg) {
            console.log('error:', msg)
        });


        // arc for the text around the disc
        $discName.arctext({
            radius: 90
        });

        // making the song list in playlist edit page sortable
        $("#sortable").sortable();
        $("#sortable").disableSelection();

    }

    var dumpToView = function (allPlaylists) {
        $page.empty();
        for (i = 0; i < allPlaylists['data'].length; i++) {
            createAlbumView(allPlaylists['data'], i);
        }
    }

    var createAlbumView = function (allPlaylists, i) {
        var id = allPlaylists[i]['id'];
        $page.append(`<div class='discctr' id='discCtr${i}'></div>`);
        var $newDiscCtr = $(`#discCtr${i}`);
        $(`<p class='discName'>${allPlaylists[i]['name']}</p>`).appendTo($newDiscCtr).arctext({
            radius: 90
        });
        $(`<div class='disc' id='disc${i}'></div>`).appendTo($newDiscCtr).css('background-image', `url(${allPlaylists[i]['image']})`);
        $(`<span data-id='${id}'><i class="fas fa-pencil-alt fa-xs"></i></span>
        <div class='whiteCircle' data-id='${id}'><i class="far fa-play-circle fa-2x"></i></div>
        <i class="fas fa-times-circle" data-id='${id}'></i>`).appendTo($(`#disc${i}`));
        var $newDiscPlay = $(`#disc${i}>.whiteCircle`);
        var $newDiscEdit = $(`#disc${i}>span`);
        var $newDiscDelete = $(`#disc${i}>.fa-times-circle`);

        //setting disc buttons function:

        // on-click play
        $newDiscPlay.on('click', (x) => {
            $playBarCtr.show();
            $page.addClass('playing');
            PB.loadAlbum($newDiscPlay.data("id"));
            // console.log($newDiscPlay);
        });

        // on-click edit
        $newDiscEdit.on('click', (x) => {
            $msgbg.show();
            $editPage.show();
            $(`#editctr>h2`).html("Edit Album");
            $(`#editctr2>h2`).html("Edit Album");
            //call api function for the album info
            showEditAlbum($newDiscEdit.data("id"));
        });

        // on-click delete
        $newDiscDelete.on('click', (x) => {
            //show "are you sure?" page
            $msgbg.show();
            $msgbox.show();
            $msgbox.append(`<h3>are you sure? all info will be lost</h3>`);
            $(`<button class="btn btn-danger">yes</button>`).appendTo($msgbox).on('click', (x) => {
                M.deleteAlbum($newDiscDelete.data("id"));
                $msgbg.hide();
                $msgbox.hide();
                $(`#msgbox>h3`).remove();
                $(`#msgbox>.btn`).remove();
            });
            $(`<button class="btn btn-success">dont delete the album please</button>`).appendTo($msgbox).on('click', (x) => {
                $msgbg.hide();
                $msgbox.hide();
                $(`#msgbox>h3`).remove();
                $(`#msgbox>.btn`).remove();
            });
        });
    }

    $search.keyup(function(){
        if($search.val().length>1){
            // console.log('search');
            $.ajax({
                url: 'http://localhost/playlist/api/playlist',
                method: 'get',
                dataType: 'json'
            }).done(function (allPlaylists) {
                dumpSearchResults(allPlaylists, $search.val());
            }).fail(function (x, msg) {
                console.log('error:', msg)
            });
        } else{
            if($search.val().length<2){
                init();
            }
        }
    });

    var dumpSearchResults = function(list, key){
        // console.log('key', key);
        console.log('list', list["data"]);
        // var newList=[];
        $page.empty();
        var lowercase;
        for(i=0;i<list["data"].length;i++){
            lowercase = list["data"][i]["name"].toLowerCase();
            if(lowercase.includes(key.toLowerCase())){
                createAlbumView(list['data'], i);
            }
        }
    }

    return {
        init: init
    }
});
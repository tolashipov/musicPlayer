var model = (function () {

    var deleteAlbum = function (id) {
        // console.log(id);
        $.ajax({
            url: 'http://localhost/playlist/api/playlist/' + id,
            method: 'delete',
            dataType: 'json'
        }).done(function () {
            console.log(id, 'deleted');
        }).fail(function (x, msg) {
            console.log('error:', msg)
        });
    }

    
    // var randomUserAPI = function () {
    //     // console.log(id);
    //     $.ajax({
    //         url: 'https://randomuser.me/api/',
    //         dataType: 'json',
    //         success: function(data) {
    //           console.log(data);
    //         }
    //     }).fail(function (x, msg) {
    //         console.log('error:', msg)
    //     });
    // }
    return {
        deleteAlbum: deleteAlbum,
        //randomUserAPI: randomUserAPI,
    }
});
/**
 * Created by admin on 21.01.2017.
 */

(function() {
    var test = document.getElementsByClassName('main-menu');
    var navControl = document.getElementsByClassName('navbar-toggle');

    navControl[0].onclick = function () {
        var mainMenuList = document.querySelectorAll('.main-menu > li');
        for (var i = 0; i < mainMenuList.length; i++) {
            // var display = mainMenuList[i].style.display;
            var none = "none";
            var li = mainMenuList[i];
            var className = li.className;
            var position;
            if ((position = className.indexOf(none)) == -1) {
                li.className += " " + none;
            }
            else {
                li.className = (position == 0) ?
                    className.slice(none.length) :
                    className.slice(0, position);
            }
        }
    }

})();

$(function(){
    var  test = $(".row:last-child");
    // test.text(123);
    $(".row:last-child").startTimer(
        {
          zeroDate: "2018-02-10"
        }
    );
})

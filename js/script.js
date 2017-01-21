/**
 * Created by admin on 21.01.2017.
 */

var test = document.getElementsByClassName('main-menu');
var navControl = document.getElementsByClassName('navbar-toggle');

navControl[0].onclick = function (){
    var mainMenuList = document.querySelectorAll('.main-menu > li');
    for (var i = 0; i < mainMenuList.length; i++) {
       var display = mainMenuList[i].style.display;

        (display == "block") ? mainMenuList[i].style.display = "none" : mainMenuList[i].style.display = "block";
    }
}
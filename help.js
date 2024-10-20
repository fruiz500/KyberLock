/*
@source: https://kyberlock.com/app/index.html

@licstart  The following is the entire license notice for the
JavaScript code in this page.

Copyright (C) 2024  Francisco Ruiz

The JavaScript code in this page is free software: you can
redistribute it and/or modify it under the terms of the GNU
General Public License (GNU GPL) as published by the Free Software
Foundation, either version 3 of the License, or (at your option)
any later version.  The code is distributed WITHOUT ANY WARRANTY;
without even the implied warranty of MERCHANTABILITY or FITNESS
FOR A PARTICULAR PURPOSE.  See the GNU GPL for more details.

As additional permission under GNU GPL version 3 section 7, you
may distribute non-source (e.g., minimized or compacted) forms of
that code without the copy of the GNU GPL normally required by
section 4, provided you include this license notice and a URL
through which recipients can access the Corresponding Source.


@licend  The above is the entire license notice
for the JavaScript code in this page.
*/

if (window.location.protocol == "http:") {				//force SSL/TLS

    var restOfUrl = window.location.href.slice(5);
    window.location = "https:" + restOfUrl;
}
    
//for the help screens
var helpHeaders = document.getElementsByClassName("helpHeading");		//add listeners to all the help headers

for (var i = 0; i < helpHeaders.length; i++) {
    helpHeaders[i].addEventListener('click', openHelp);
}

var helpHeaders2 = document.getElementsByClassName("helpHeading2");		//2nd level help

for (var i = 0; i < helpHeaders2.length; i++) {
    helpHeaders2[i].addEventListener('click', openHelp2);
}

//for opening one item at a time in the Help screen, with animation
function openHelp(){
    var helpItems = document.getElementsByClassName('helpHeading');
    for(var i = 0; i < helpItems.length; i++){					//hide all help texts
    var panel = helpItems[i].nextElementSibling;
    panel.style.maxHeight = null;
}
helpItems = document.getElementsByClassName('helpHeading2');
for(var i = 0; i < helpItems.length; i++){					//hide also secondary texts
    var panel = helpItems[i].nextElementSibling;
    panel.style.maxHeight = null;
}
    var panel = this.nextElementSibling;							//except for the one clicked
    panel.style.maxHeight = panel.scrollHeight + "px"
}

//for secondary help items
function openHelp2(){
    var panel = this.nextElementSibling,
    parent = this.parentElement;
    panel.style.maxHeight = panel.scrollHeight + "px";
    setTimeout(function(){parent.style.maxHeight = parent.scrollHeight + "px"},301)
}
    
ksplarp
=======

We're going to be testing and maybe using jqwidgits which will be availible on this github page.


jQWidgets is not free for commercial use.
Please see this webpage for more information: http://www.jqwidgets.com/license/



IFS=$'\n'; for i in $( seq -w 1 10 ); do convert -size 128x128 xc: +noise Random -colorspace Gray -normalize "noise$i.png"; done
convert -delay 10 ./noise* output.gif

#!/bin/bash

var1= 
var2=" "
var3=""

if [ "x$var1" = "x" ]
then
	echo 'var1 is empty'
else
	echo 'var1 is not empty'
fi

if [ "x$var2" = "x" ]
then
	echo 'var2 is empty'
else
	echo 'var2 is not empty'
fi

if [ "x$var3" = "x" ] || [ "x$var3" = "xnull" ]
then
	echo 'var3 is empty'
else
	echo 'var3 is not empty'
fi

if [ "x$foo"  = "x" ]
then
	echo 'foo is empty'
else
	echo 'foo is not empty'
fi
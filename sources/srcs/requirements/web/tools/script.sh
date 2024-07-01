#!/bin/bash

if	! test -f $__WITNESS:
then
	python3 -m pip install --upgrade pip

	pip install -r /django/requirements.txt

	cd /home/
		django-admin startproject webapps
		chmod -R o+rwx webapps #DEBUG To Remove
	cd /

	touch $__WITNESS && chmod 400 $__WITNESS
fi

python3 /home/webapps/manage.py runserver 0.0.0.0:8000

# tail -f /dev/null

#!/bin/sh

# WORKDIR /usr/src/apps

if	! test -e $HEALTHFLAG_FILE
then

	python manage.py migrate

	touch $HEALTHFLAG_FILE && chmod 400 $HEALTHFLAG_FILE
fi

python manage.py runserver 0.0.0.0:8000

# tail -f /dev/null

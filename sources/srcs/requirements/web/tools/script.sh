#!/bin/sh

if	! test -e $HEALTHFLAG_FILE
then

	python manage.py migrate
	echo 'yes' | python manage.py collectstatic

	touch $HEALTHFLAG_FILE && chmod 400 $HEALTHFLAG_FILE
fi

# gunicorn web.wsgi
# python manage.py runserver 0.0.0.0:8000
$WEB_ENTRYPOINT
# tail -f /dev/null

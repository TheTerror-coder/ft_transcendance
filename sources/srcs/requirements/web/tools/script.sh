#!/bin/sh

# tail -f /dev/null
if	! test -e $HEALTHFLAG_FILE
then

	python manage.py migrate
	echo 'yes' | python manage.py collectstatic

	touch $HEALTHFLAG_FILE && chmod 400 $HEALTHFLAG_FILE
fi

$WEB_ENTRYPOINT

#!/bin/sh

# sh -c $BACKEND_HOME/container-init.d/HOST_IP.sh
if	! test -e $HEALTHFLAG_FILE
then

	python manage.py migrate
	echo 'yes' | python manage.py collectstatic

	touch $HEALTHFLAG_FILE && chmod 400 $HEALTHFLAG_FILE
fi

$BACKEND_ENTRYPOINT
# export DJANGO_SETTINGS_MODULE=backend.settings
# daphne -b 0.0.0.0 -p 8001 backend.asgi:application &
# tail -f /dev/null
#!/bin/sh

sh -c $CONTAINER_HOME/container-init.d/HOST_IP.sh

# tail -f /dev/null
python manage.py makemigrations backgame
python manage.py makemigrations
python manage.py migrate

if	! test -e $HEALTHFLAG_FILE
then

	echo 'yes' | python manage.py collectstatic

	touch $HEALTHFLAG_FILE && chmod 400 $HEALTHFLAG_FILE
fi

$CONTAINER_ENTRYPOINT
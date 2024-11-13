#!/bin/sh

sh -c $PYTHON_HOME/container-init.d/HOST_IP.sh

# tail -f /dev/null
if	! test -e $HEALTHFLAG_FILE
then

	python manage.py migrate
	echo 'yes' | python manage.py collectstatic

	touch $HEALTHFLAG_FILE && chmod 400 $HEALTHFLAG_FILE
fi

python3 /usr/share/gameserver/apps/backgame/index.py &

$PYTHON_ENTRYPOINT

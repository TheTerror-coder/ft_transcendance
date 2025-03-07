#!/bin/sh -e

python manage.py makemigrations usermanagement --no-input
python manage.py makemigrations --no-input
python manage.py migrate --no-input

if	! test -e $HEALTHFLAG_FILE
then

	echo 'yes' | python manage.py collectstatic --no-input

	touch $HEALTHFLAG_FILE && chmod 400 $HEALTHFLAG_FILE
fi

$CONTAINER_ENTRYPOINT

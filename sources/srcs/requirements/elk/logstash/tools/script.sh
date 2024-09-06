#!/bin/sh

# WORKDIR /usr/src/apps

if	! test -e $HEALTHFLAG_FILE
then

	touch $HEALTHFLAG_FILE && chmod 400 $HEALTHFLAG_FILE
fi

docker-entrypoint.sh postgres

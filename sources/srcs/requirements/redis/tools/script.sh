#!/bin/sh -e

if	! test -e $HEALTHFLAG_FILE
then

	touch $HEALTHFLAG_FILE && chmod 400 $HEALTHFLAG_FILE
fi

docker-entrypoint.sh redis-server $REDIS_HOME/container-init.d/redis.conf

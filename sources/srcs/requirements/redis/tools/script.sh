#!/bin/sh -e

echo "envsubst redis.conf ..."
< $REDIS_HOME/container-init.d/redis.conf.template envsubst '$REDIS_PORT $REDIS_DATA $REDIS_HOME' > $REDIS_HOME/container-init.d/redis.conf

if	! test -e $HEALTHFLAG_FILE
then

	touch $HEALTHFLAG_FILE && chmod 400 $HEALTHFLAG_FILE
fi

echo -e "\n--- Fetching redis default user password ... ---"
redis_default_password=$( \
		curl -s --cacert $VAULT_CACERT \
			-H "Authorization: Bearer $SECRET_ACCESS_TOKEN" \
			https://vault_c:$VAULT_API_PORT/v1/secret/data/redis_default | \
			jq -r .data.data.password \
	)
if [ "x$redis_default_password" = "x" ] || [ "x$redis_default_password" = "xnull" ]
then
	echo "redis default user password fetching failed!"
	exit 1
else
	echo "redis default user password fetching succeeded!"
fi


echo -e "\n--- Fetching redis onepong user password ... ---"
redis_onepong_password=$( \
		curl -s --cacert $VAULT_CACERT \
			-H "Authorization: Bearer $SECRET_ACCESS_TOKEN" \
			https://vault_c:$VAULT_API_PORT/v1/secret/data/redis_onepong | \
			jq -r .data.data.password \
	)
if [ "x$redis_onepong_password" = "x" ] || [ "x$redis_onepong_password" = "xnull" ]
then
	echo "redis onepong user password fetching failed!"
	exit 1
else
	echo "redis onepong user password fetching succeeded!"
fi


docker-entrypoint.sh redis-server $REDIS_HOME/container-init.d/redis.conf --requirepass $redis_default_password --user $REDIS_USER on allkeys allchannels allcommands ">$redis_onepong_password"

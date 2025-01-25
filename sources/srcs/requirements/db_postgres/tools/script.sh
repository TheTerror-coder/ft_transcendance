#!/bin/sh -e

# tail -f /dev/null
< /usr/local/share/postgresql/postgresql.conf.sample.template envsubst '$POSTGRES_PORT' > /usr/local/share/postgresql/postgresql.conf.sample

if	! test -e $HEALTHFLAG_FILE
then
	echo -e "\n--- Setting POSTGRES_PASSWORD ---"
	export POSTGRES_PASSWORD=$( \
		curl -s --cacert $VAULT_CACERT \
			-H "Authorization: Bearer $SECRET_ACCESS_TOKEN" \
			https://vault_c:$VAULT_API_PORT/v1/secret/data/postgres | \
			jq -r .data.data.password \
	)
	if [ "x$POSTGRES_PASSWORD" = "x" ] || [ "x$POSTGRES_PASSWORD" = "xnull" ]
	then
		echo "POSTGRES_PASSWORD setting failure!"
		exit 1
	else
		echo "POSTGRES_PASSWORD setting success!"
	fi

	touch $HEALTHFLAG_FILE && chmod 400 $HEALTHFLAG_FILE
fi

docker-entrypoint.sh postgres

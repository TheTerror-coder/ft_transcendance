#!/bin/sh -e

if	! test -e $HEALTHFLAG_FILE
then
	echo -e "\n--- Setting POSTGRES_PASSWORD ---"
	export POSTGRES_PASSWORD=$( \
		curl -s --cacert $VAULT_CACERT \
			-H "Authorization: Bearer $SECRET_ACCESS_TOKEN" \
			https://vault_c:8200/v1/secret/data/postgres | \
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

#!/bin/sh

echo "************beginning of the program**********"


# tail -f /dev/null
# if	! test -e $HEALTHFLAG_FILE
# then
# 	export VAULT_DEV_ROOT_TOKEN_ID=$(cat $VAULT_TOKEN_ID_FILE)
# echo "************VAULT_DEV_ROOT_TOKEN_ID=$VAULT_DEV_ROOT_TOKEN_ID**********" >&2
# 	touch $HEALTHFLAG_FILE && chmod 400 $HEALTHFLAG_FILE
# fi

docker-entrypoint.sh server

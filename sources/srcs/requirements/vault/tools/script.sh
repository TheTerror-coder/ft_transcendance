#!/bin/sh -e

< $VAULT_HOME/config/vault.hcl.template envsubst '$VAULT_API_PORT $VAULT_CLUSTER_PORT' > $VAULT_HOME/config/vault.hcl

/usr/local/bin/docker-entrypoint.sh server
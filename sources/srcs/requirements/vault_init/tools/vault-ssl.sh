#!/bin/sh -e

generate_vault_tls_certificates() {
	echo "Creating Vault's TLS CA"
	openssl genrsa -out $VAULT_HOME/volumes/vault/certs/ca/ca.key 2048
	openssl req -x509 -new -nodes -key $VAULT_HOME/volumes/vault/certs/ca/ca.key -sha256 -days 365 -out $VAULT_HOME/volumes/vault/certs/ca/ca.crt -config $VAULT_HOME/container-init.d/vault-ssl.cnf -extensions v3_ca -subj "/CN=localhost"

	echo "Creating Vault's TLS Certificates"
	openssl genrsa -out $VAULT_HOME/volumes/vault/certs/vault.key 2048
	openssl req -new -key $VAULT_HOME/volumes/vault/certs/vault.key -out $VAULT_HOME/volumes/vault/certs/vault.csr -config $VAULT_HOME/container-init.d/vault-ssl.cnf -extensions v3_req
	openssl x509 -req -in $VAULT_HOME/volumes/vault/certs/vault.csr -CA $VAULT_HOME/volumes/vault/certs/ca/ca.crt -CAkey $VAULT_HOME/volumes/vault/certs/ca/ca.key -CAcreateserial -out $VAULT_HOME/volumes/vault/certs/vault.crt -days 365 -sha256 -extfile $VAULT_HOME/container-init.d/vault-ssl.cnf -extensions v3_req

	echo "Setting Vault's TLS certificate files permissions"
	chown -R $VAULT_UID:$SHARED_GID $VAULT_HOME/volumes/vault/certs;
	find $VAULT_HOME/volumes/vault/certs -type d -exec chmod 750 \{\} \;;
	find $VAULT_HOME/volumes/vault/certs -type f -exec chmod 600 \{\} \;;
	chmod 640 $VAULT_CACERT
}

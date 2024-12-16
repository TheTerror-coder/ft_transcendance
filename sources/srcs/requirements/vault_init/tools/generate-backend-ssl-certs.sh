#!/bin/bash

#######################################
###### Backend Intermediate CA ##########
#######################################

create_backend_intermediate_ca_role () {
	echo -e "\nBackend Intermediate CA - Creating a role"
	vault write backend/roles/backend_intermediate_ca_role \
		issuer_ref="$(vault read -field=default backend/config/issuers)" \
		allowed_domains="$BACKEND_ALT_NAMES" \
		allow_subdomains=true \
		allow_bare_domains=true \
		organization="42 Lyon Ft_transcendance Group" \
		ou="Ft_transcendance Project Unit" \
		country="FR" \
		province="Auvergne-Rhône-Alpes" \
		locality="Lyon" \
		max_ttl="2160h" >> /dev/null
}

setup_backend_intermediate_ca_crl_urls () {
	echo -e "\nBackend Intermediate CA - configuring CA and CRL urls"
	vault write backend/config/urls \
		issuing_certificates="$VAULT_ADDR/v1/backend/ca" \
		crl_distribution_points="$VAULT_ADDR/v1/backend/crl"
}

generate_backend_intermediate_ca () {
	echo -e "\nBackend Intermediate CA - generating"
	vault pki issue --issuer_name="Backend-Intermediate-CA" \
		/root-ca/issuer/$(vault list -format=json root-ca/issuers/ | jq -r '.[0]') \
		/backend/ \
		common_name="Transcendance Intermediate Authority" \
		exclude_cn_from_sans=true \
		alt_names="$BACKEND_ALT_NAMES" \
		permitted_dns_domains="$BACKEND_ALT_NAMES" \
		ip_sans="127.0.0.1,$HOST_IP" \
		issuer_name="Root-Certificate-Authority" \
		key_name="ca-key" \
		organization="42 Lyon Ft_transcendance Group" \
		ou="Ft_transcendance Project Unit" \
		country="FR" \
		province="Auvergne-Rhône-Alpes" \
		locality="Lyon" \
		key_type="rsa" \
		key_bits="4096" \
		max_depth_len=1 \
		ttl="43800h" >> /dev/null
	create_backend_intermediate_ca_role
	setup_backend_intermediate_ca_crl_urls
}

enable_backend_pki_engine () {
	echo -e "\nBackend Intermediate CA - Enabling PKI engine at 'backend/' path"
	vault secrets enable -path=backend pki
	vault secrets tune -max-lease-ttl=43800h backend
}

#######################################
### Backend TLS Certificates Creation ###
#######################################

request_backend_certificate () {
	mkdir -p $VAULT_HOME/volumes/backend/certs/ca

	echo -e "\nBackend SSL Certificate - creating..."
	curl -s --cacert $VAULT_CACERT $VAULT_ADDR/v1/root-ca/ca/pem --output $VAULT_HOME/volumes/backend/certs/ca/root_ca.crt
	vault write -format=json backend/issue/backend_intermediate_ca_role \
		common_name="backend" \
		alt_names="$BACKEND_ALT_NAMES" \
		ip_sans="$HOST_IP" \
		exclude_cn_from_sans=true \
		ttl="720h" \
		| tee \
		>(jq -r .data.certificate > $VAULT_HOME/volumes/backend/certs/backend.crt) \
		>(jq -r .data.issuing_ca > $VAULT_HOME/volumes/backend/certs/ca/ca.crt) \
		>(jq -r .data.private_key > $VAULT_HOME/volumes/backend/certs/backend.key) \
		> /dev/null
	cat $VAULT_HOME/volumes/backend/certs/ca/ca.crt >> $VAULT_HOME/volumes/backend/certs/backend.crt
	cat $VAULT_HOME/volumes/backend/certs/ca/root_ca.crt >> $VAULT_HOME/volumes/backend/certs/backend.crt
	if [ -s $VAULT_HOME/volumes/backend/certs/backend.crt ] || [ -s $VAULT_HOME/volumes/backend/certs/backend.key ]; then
		echo -e "Backend SSL Certificate - done!"
	else
		echo -e "Backend SSL Certificate - creation went wrong!"
	fi
}

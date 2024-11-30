#!/bin/bash

#######################################
###### GameServer Intermediate CA ##########
#######################################

create_gameserver_intermediate_ca_role () {
	echo -e "\nGameServer Intermediate CA - Creating a role"
	vault write gameserver/roles/gameserver_intermediate_ca_role \
		issuer_ref="$(vault read -field=default gameserver/config/issuers)" \
		allowed_domains="$GAMESERVER_ALT_NAMES" \
		allow_subdomains=true \
		allow_bare_domains=true \
		organization="42 Lyon Ft_transcendance Group" \
		ou="Ft_transcendance Project Unit" \
		country="FR" \
		province="Auvergne-Rhône-Alpes" \
		locality="Lyon" \
		max_ttl="2160h" >> /dev/null
}

setup_gameserver_intermediate_ca_crl_urls () {
	echo -e "\nGameServer Intermediate CA - configuring CA and CRL urls"
	vault write gameserver/config/urls \
		issuing_certificates="$VAULT_ADDR/v1/gameserver/ca" \
		crl_distribution_points="$VAULT_ADDR/v1/gameserver/crl"
}

generate_gameserver_intermediate_ca () {
	echo -e "\nGameServer Intermediate CA - generating"
	vault pki issue --issuer_name="GameServer-Intermediate-CA" \
		/root-ca/issuer/$(vault list -format=json root-ca/issuers/ | jq -r '.[0]') \
		/gameserver/ \
		common_name="Transcendance Intermediate Authority" \
		exclude_cn_from_sans=true \
		alt_names="$GAMESERVER_ALT_NAMES" \
		permitted_dns_domains="$GAMESERVER_ALT_NAMES" \
		ip_sans="127.0.0.1" \
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
	create_gameserver_intermediate_ca_role
	setup_gameserver_intermediate_ca_crl_urls
}

enable_gameserver_pki_engine () {
	echo -e "\nGameServer Intermediate CA - Enabling PKI engine at 'gameserver/' path"
	vault secrets enable -path=gameserver pki
	vault secrets tune -max-lease-ttl=43800h gameserver
}

#######################################
### GameServer TLS Certificates Creation ###
#######################################

request_gameserver_certificate () {
	mkdir -p $VAULT_HOME/volumes/gameserver/certs/ca

	echo -e "\nGameServer SSL Certificate - creating..."
	curl -s --cacert $VAULT_CACERT $VAULT_ADDR/v1/root-ca/ca/pem --output $VAULT_HOME/volumes/gameserver/certs/ca/root_ca.crt
	vault write -format=json gameserver/issue/gameserver_intermediate_ca_role \
		common_name="gameserver" \
		alt_names="$GAMESERVER_ALT_NAMES" \
		exclude_cn_from_sans=true \
		ttl="720h" \
		| tee \
		>(jq -r .data.certificate > $VAULT_HOME/volumes/gameserver/certs/gameserver.crt) \
		>(jq -r .data.issuing_ca > $VAULT_HOME/volumes/gameserver/certs/ca/ca.crt) \
		>(jq -r .data.private_key > $VAULT_HOME/volumes/gameserver/certs/gameserver.key) \
		> /dev/null
	cat $VAULT_HOME/volumes/gameserver/certs/ca/ca.crt >> $VAULT_HOME/volumes/gameserver/certs/gameserver.crt
	cat $VAULT_HOME/volumes/gameserver/certs/ca/root_ca.crt >> $VAULT_HOME/volumes/gameserver/certs/gameserver.crt
	if [ -s $VAULT_HOME/volumes/gameserver/certs/gameserver.crt ] || [ -s $VAULT_HOME/volumes/gameserver/certs/gameserver.key ]; then
		echo -e "GameServer SSL Certificate - done!"
	else
		echo -e "GameServer SSL Certificate - creation went wrong!"
	fi
}

#!/bin/bash

#######################################
###### Node Intermediate CA ##########
#######################################

create_node_intermediate_ca_role () {
	echo -e "\Node Intermediate CA - Creating a role"
	vault write node/roles/node_intermediate_ca_role \
		issuer_ref="$(vault read -field=default node/config/issuers)" \
		allowed_domains="$NODE_ALT_NAMES" \
		allow_subdomains=true \
		allow_bare_domains=true \
		organization="42 Lyon Ft_transcendance Group" \
		ou="Ft_transcendance Project Unit" \
		country="FR" \
		province="Auvergne-Rhône-Alpes" \
		locality="Lyon" \
		max_ttl="2160h" >> /dev/null
}

setup_node_intermediate_ca_crl_urls () {
	echo -e "\nNode Intermediate CA - configuring CA and CRL urls"
	vault write node/config/urls \
		issuing_certificates="$VAULT_ADDR/v1/node/ca" \
		crl_distribution_points="$VAULT_ADDR/v1/node/crl"
}

generate_node_intermediate_ca () {
	echo -e "\nNode Intermediate CA - generating"
	vault pki issue --issuer_name="Node-Intermediate-CA" \
		/root-ca/issuer/$(vault list -format=json root-ca/issuers/ | jq -r '.[0]') \
		/node/ \
		common_name="Transcendance Intermediate Authority" \
		exclude_cn_from_sans=true \
		alt_names="$NODE_ALT_NAMES" \
		permitted_dns_domains="$NODE_ALT_NAMES" \
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
	create_node_intermediate_ca_role
	setup_node_intermediate_ca_crl_urls
}

enable_node_pki_engine () {
	echo -e "\nNode Intermediate CA - Enabling PKI engine at 'node/' path"
	vault secrets enable -path=node pki
	vault secrets tune -max-lease-ttl=43800h node
}

#######################################
### Node TLS Certificates Creation ###
#######################################

request_node_certificate () {
	mkdir -p $VAULT_HOME/volumes/node/certs/ca

	echo -e "\nNode SSL Certificate - creating..."
	curl -s --cacert $VAULT_CACERT $VAULT_ADDR/v1/root-ca/ca/pem --output $VAULT_HOME/volumes/node/certs/ca/root_ca.crt
	vault write -format=json node/issue/node_intermediate_ca_role \
		common_name="node" \
		alt_names="$NODE_ALT_NAMES" \
		exclude_cn_from_sans=true \
		ttl="720h" \
		| tee \
		>(jq -r .data.certificate > $VAULT_HOME/volumes/node/certs/node.crt) \
		>(jq -r .data.issuing_ca > $VAULT_HOME/volumes/node/certs/ca/ca.crt) \
		>(jq -r .data.private_key > $VAULT_HOME/volumes/node/certs/node.key) \
		> /dev/null
	cat $VAULT_HOME/volumes/node/certs/ca/ca.crt >> $VAULT_HOME/volumes/node/certs/node.crt
	cat $VAULT_HOME/volumes/node/certs/ca/root_ca.crt >> $VAULT_HOME/volumes/node/certs/node.crt
	if [ -s $VAULT_HOME/volumes/node/certs/node.crt ] || [ -s $VAULT_HOME/volumes/node/certs/node.key ]; then
		echo -e "Node SSL Certificate - done!"
	else
		echo -e "Node SSL Certificate - creation went wrong!"
	fi
}

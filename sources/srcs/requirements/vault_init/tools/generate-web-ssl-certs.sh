#!/bin/bash

#######################################
###### Web Intermediate CA ##########
#######################################

create_web_intermediate_ca_role () {
	echo -e "\nWeb Intermediate CA - Creating a role"
	vault write web/roles/web_intermediate_ca_role \
		issuer_ref="$(vault read -field=default web/config/issuers)" \
		allowed_domains="$WEB_ALT_NAMES" \
		allow_subdomains=true \
		allow_bare_domains=true \
		organization="42 Lyon Ft_transcendance Group" \
		ou="Ft_transcendance Project Unit" \
		country="FR" \
		province="Auvergne-Rhône-Alpes" \
		locality="Lyon" \
		max_ttl="2160h" >> /dev/null
}

setup_web_intermediate_ca_crl_urls () {
	echo -e "\nWeb Intermediate CA - configuring CA and CRL urls"
	vault write web/config/urls \
		issuing_certificates="$VAULT_ADDR/v1/web/ca" \
		crl_distribution_points="$VAULT_ADDR/v1/web/crl"
}

generate_web_intermediate_ca () {
	echo -e "\nWeb Intermediate CA - generating"
	vault pki issue --issuer_name="Web-Intermediate-CA" \
		/root-ca/issuer/$(vault list -format=json root-ca/issuers/ | jq -r '.[0]') \
		/web/ \
		common_name="Transcendance Intermediate Authority" \
		exclude_cn_from_sans=true \
		alt_names="$WEB_ALT_NAMES" \
		permitted_dns_domains="$WEB_ALT_NAMES" \
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
	create_web_intermediate_ca_role
	setup_web_intermediate_ca_crl_urls
}

enable_web_pki_engine () {
	echo -e "\nWeb Intermediate CA - Enabling PKI engine at 'web/' path"
	vault secrets enable -path=web pki
	vault secrets tune -max-lease-ttl=43800h web
}

#######################################
### Web TLS Certificates Creation ###
#######################################

request_web_certificate () {
	mkdir -p /web/certs/ca

	echo -e "\nWeb SSL Certificate - creating..."
	curl -s --cacert $VAULT_CACERT $VAULT_ADDR/v1/root-ca/ca/pem --output /web/certs/ca/root_ca.crt
	vault write -format=json web/issue/web_intermediate_ca_role \
		common_name="web" \
		alt_names="$WEB_ALT_NAMES" \
		exclude_cn_from_sans=true \
		ttl="720h" \
		| tee \
		>(jq -r .data.certificate > /web/certs/web.crt) \
		>(jq -r .data.issuing_ca > /web/certs/ca/ca.crt) \
		>(jq -r .data.private_key > /web/certs/web.key) \
		> /dev/null
	cat /web/certs/ca/ca.crt >> /web/certs/web.crt
	cat /web/certs/ca/root_ca.crt >> /web/certs/web.crt
	if [ -s /web/certs/web.crt ] || [ -s /web/certs/web.key ]; then
		echo -e "Web SSL Certificate - done!"
	else
		echo -e "Web SSL Certificate - creation went wrong!"
	fi
}

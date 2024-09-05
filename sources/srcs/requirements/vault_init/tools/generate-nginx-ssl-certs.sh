#!/bin/bash

#######################################
###### Nginx Intermediate CA ##########
#######################################

create_nginx_intermediate_ca_role () {
	echo -e "\nNginx Intermediate CA - Creating a role"
	vault write nginx/roles/nginx_intermediate_ca_role \
		issuer_ref="$(vault read -field=default nginx/config/issuers)" \
		allowed_domains="$MODSEC_ALT_NAMES" \
		allow_subdomains=true \
		allow_bare_domains=true \
		organization="42 Lyon Ft_transcendance Group" \
		ou="Ft_transcendance Project Unit" \
		country="FR" \
		province="Auvergne-Rhône-Alpes" \
		locality="Lyon" \
		max_ttl="2160h" >> /dev/null
}

setup_nginx_intermediate_ca_crl_urls () {
	echo -e "\nNginx Intermediate CA - configuring CA and CRL urls"
	vault write nginx/config/urls \
		issuing_certificates="$VAULT_ADDR/v1/nginx/ca" \
		crl_distribution_points="$VAULT_ADDR/v1/nginx/crl"
}

generate_nginx_intermediate_ca () {
	echo -e "\nNginx Intermediate CA - generating"
	vault pki issue --issuer_name="Nginx-Intermediate-CA" \
		/root-ca/issuer/$(vault list -format=json root-ca/issuers/ | jq -r '.[0]') \
		/nginx/ \
		common_name="Transcendance Intermediate Authority" \
		exclude_cn_from_sans=true \
		alt_names="$MODSEC_ALT_NAMES" \
		permitted_dns_domains="$MODSEC_ALT_NAMES" \
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
	create_nginx_intermediate_ca_role
	setup_nginx_intermediate_ca_crl_urls
}

enable_nginx_pki_engine () {
	echo -e "\nNginx Intermediate CA - Enabling PKI engine at 'nginx/' path"
	vault secrets enable -path=nginx pki
	vault secrets tune -max-lease-ttl=43800h nginx
}

#######################################
### Nginx TLS Certificates Creation ###
#######################################

request_nginx_certificate () {
	mkdir -p /nginx/certs/ca

	echo -e "\nNginx SSL Certificate - creating..."
	curl -s --cacert $VAULT_CACERT $VAULT_ADDR/v1/root-ca/ca/pem --output /nginx/certs/ca/root_ca.crt
	vault write -format=json nginx/issue/nginx_intermediate_ca_role \
		common_name="transcendance.fr" \
		alt_names="$MODSEC_ALT_NAMES" \
		exclude_cn_from_sans=true \
		ttl="720h" \
		| tee \
		>(jq -r .data.certificate > /nginx/certs/nginx.crt) \
		>(jq -r .data.issuing_ca > /nginx/certs/ca/ca.crt) \
		>(jq -r .data.private_key > /nginx/certs/nginx.key) \
		> /dev/null
	cat /nginx/certs/ca/ca.crt >> /nginx/certs/nginx.crt
	cat /nginx/certs/ca/root_ca.crt >> /nginx/certs/nginx.crt
	if [ -s /nginx/certs/nginx.crt ] || [ -s /nginx/certs/nginx.key ]; then
		echo -e "Nginx SSL Certificate - done!"
	else
		echo -e "Nginx SSL Certificate - creation went wrong!"
	fi
}

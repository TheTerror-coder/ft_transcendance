#!/bin/bash

#######################################
############# Root CA #################
#######################################

create_root_ca_role () {
	echo -e "\nRoot CA - Creating a role"
	vault write root-ca/roles/root_ca_role \
		allowed_domains="$ALT_NAMES" \
		allow_subdomains=true \
		allow_bare_domains=true \
		organization="42 Lyon Ft_transcendance Group" \
		ou="Ft_transcendance Project Unit" \
		country="FR" \
		province="Auvergne-Rhône-Alpes" \
		locality="Lyon" >> /dev/null
}

setup_ca_crl_urls () {
	echo -e "\nRoot CA - configuring CA and CRL urls"
	vault write root-ca/config/urls \
		issuing_certificates="$VAULT_ADDR/v1/root-ca/ca" \
		crl_distribution_points="$VAULT_ADDR/v1/root-ca/crl"
}

generate_root_ca () {
	echo -e "\nRoot CA - generating"
	vault write -field=certificate root-ca/root/generate/internal \
		common_name="Transcendance CA" \
		exclude_cn_from_sans=true \
		alt_names="$ALT_NAMES" \
		permitted_dns_domains="$ALT_NAMES" \
		ip_sans="127.0.0.1" \
		issuer_name="Root-Certificate-Authority" \
		key_name="ca-key" \
		organization="42 Lyon Ft_transcendance Group" \
		ou="Ft_transcendance Project Unit" \
		country="FR" \
		province="Auvergne-Rhône-Alpes" \
		locality="Lyon" \
		max_path_length=1 \
		ttl=87600h > /dev/null #/nginx/certs/ca/root_ca.crt
		# OU ssl certificate field is depreciated at the request of the CA/Browser Forum since August 1, 2022. So it is pointless.
	create_root_ca_role
	setup_ca_crl_urls
}

enable_root_ca_pki_engine () {
	echo -e "\nRoot CA - Enabling PKI engine at 'root-ca/' path"
	vault secrets enable -path=root-ca pki #>> /dev/null
	vault secrets tune -max-lease-ttl=87600h root-ca #>> /dev/null
}

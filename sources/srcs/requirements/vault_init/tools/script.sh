#!/bin/sh

echo "************beginning of the program**********"

# tail -f /dev/null

set -e

init () {
	echo -e "\nVault - initializing the server..."
	vault operator init > /vault/file/keys
}

unseal () {
	echo -e "\nVault - unsealing vault..."
	vault operator unseal $(grep 'Key 1:' /vault/file/keys | awk '{print $NF}')
	vault operator unseal $(grep 'Key 2:' /vault/file/keys | awk '{print $NF}')
	vault operator unseal $(grep 'Key 3:' /vault/file/keys | awk '{print $NF}')
}

log_in () {
	root_token=$(grep 'Initial Root Token:' /vault/file/keys | awk '{print $NF}')
	vault login $root_token >> /dev/null
}

enable_secret_kv_engine () {
	echo -e "\nSecrets Store Engine - enabling 'secret' Engine"
	vault secrets enable -path=secret -version=2 kv >> /dev/null
}


#######################################
############## Policies ###############
#######################################

create_policies () {
	root_token=$(grep 'Initial Root Token:' /vault/file/keys | awk '{print $NF}')
	curl -s --cacert $VAULT_CACERT -H "Authorization: Bearer $root_token" --data @/run/secrets/password_policy_json https://vault_c:8200/v1/sys/policies/password/password_policy >> /dev/null
	curl -s --cacert $VAULT_CACERT -H "Authorization: Bearer $root_token" --data @/run/secrets/secret_access_policy_json https://vault_c:8200/v1/sys/policy/secret_access_policy >> /dev/null
	curl -s --cacert $VAULT_CACERT -H "Authorization: Bearer $root_token" --data @/run/secrets/nginx_pki_access_policy_json https://vault_c:8200/v1/sys/policy/nginx_pki_access >> /dev/null
}

#######################################
############## Tokens ###############
#######################################

create_tokens () {
	vault token create -id $(cat /run/secrets/root_access_token) >> /dev/null # TODO remove in production, better get rid of root tokens for security matter
	vault token create -id $(cat /run/secrets/secret_access_token) -policy='secret_access_policy' >> /dev/null
	vault token create -id $(cat /run/secrets/nginx_pki_access_token) -policy='nginx_pki_access' >> /dev/null
}

#######################################
############## Postgres ###############
#######################################

create_postgres_password () {
	root_token=$(grep 'Initial Root Token:' /vault/file/keys | awk '{print $NF}')
	postgres_password=$(curl -s --cacert $VAULT_CACERT -H "Authorization: Bearer $root_token" https://vault_c:8200/v1/sys/policies/password/password_policy/generate | jq .data.password)
	payload=$(echo {  \"options\": {    \"cas\": 0  },  \"data\": {    \"password\": $postgres_password }})
	curl -s --cacert $VAULT_CACERT  -H "Authorization: Bearer $root_token" --data "$payload" https://vault_c:8200/v1/secret/data/postgres >> /dev/null
}

#######################################
############## Elastic ################
#######################################

create_elastic_password () {
	root_token=$(grep 'Initial Root Token:' /vault/file/keys | awk '{print $NF}')
	elastic_password=$(curl -s --cacert $VAULT_CACERT -H "Authorization: Bearer $root_token" https://vault_c:8200/v1/sys/policies/password/password_policy/generate | jq .data.password)
	payload=$(echo {  \"options\": {    \"cas\": 0  },  \"data\": {    \"password\": $elastic_password }})
	curl -s --cacert $VAULT_CACERT  -H "Authorization: Bearer $root_token" --data "$payload" https://vault_c:8200/v1/secret/data/elastic >> /dev/null
}

#######################################
############### Kibana ################
#######################################

create_kibana_password () {
	root_token=$(grep 'Initial Root Token:' /vault/file/keys | awk '{print $NF}')
	kibana_password=$(curl -s --cacert $VAULT_CACERT -H "Authorization: Bearer $root_token" https://vault_c:8200/v1/sys/policies/password/password_policy/generate | jq .data.password)
	payload=$(echo {  \"options\": {    \"cas\": 0  },  \"data\": {    \"password\": $kibana_password }})
	curl -s --cacert $VAULT_CACERT  -H "Authorization: Bearer $root_token" --data "$payload" https://vault_c:8200/v1/secret/data/kibana >> /dev/null
}

#######################################
############# Logstash ################
#######################################

create_logstash_password () {
	root_token=$(grep 'Initial Root Token:' /vault/file/keys | awk '{print $NF}')
	logstash_password=$(curl -s --cacert $VAULT_CACERT -H "Authorization: Bearer $root_token" https://vault_c:8200/v1/sys/policies/password/password_policy/generate | jq .data.password)
	payload=$(echo {  \"options\": {    \"cas\": 0  },  \"data\": {    \"password\": $logstash_password }})
	curl -s --cacert $VAULT_CACERT  -H "Authorization: Bearer $root_token" --data "$payload" https://vault_c:8200/v1/secret/data/logstash >> /dev/null
}

create_logstash_es_client_password () {
	root_token=$(grep 'Initial Root Token:' /vault/file/keys | awk '{print $NF}')
	logstash_es_client_password=$(curl -s --cacert $VAULT_CACERT -H "Authorization: Bearer $root_token" https://vault_c:8200/v1/sys/policies/password/password_policy/generate | jq .data.password)
	payload=$(echo {  \"options\": {    \"cas\": 0  },  \"data\": {    \"password\": $logstash_es_client_password }})
	curl -s --cacert $VAULT_CACERT  -H "Authorization: Bearer $root_token" --data "$payload" https://vault_c:8200/v1/secret/data/logstash_es_client >> /dev/null
}

#######################################
############# Root CA #################
#######################################

create_nginx_root_ca_role () {
	echo -e "\nNginx Root CA - Creating a role"
	vault write nginx/roles/nginx_root_ca_role \
		allowed_domains="$NGINX_ALT_NAMES" \
		allow_subdomains=true \
		allow_bare_domains=true \
		organization="42 Lyon Ft_transcendance Group" \
		ou="Ft_transcendance Project" \
		country="FR" \
		province="Auvergne-Rhône-Alpes" \
		locality="Lyon" >> /dev/null
}
setup_ca_crl_urls () {
	echo -e "\nNginx Root CA - configuring CA and CRL urls"
	vault write nginx/config/urls \
		issuing_certificates="$VAULT_ADDR/v1/nginx/ca" \
		crl_distribution_points="$VAULT_ADDR/v1/nginx/crl"
}

generate_nginx_root_ca () {
	echo -e "\nNginx Root CA - generating"
	vault write -field=certificate nginx/root/generate/internal \
		common_name="Transcendance CA" \
		exclude_cn_from_sans=true \
		alt_names="$NGINX_ALT_NAMES" \
		permitted_dns_domains="$NGINX_ALT_NAMES" \
		ip_sans="127.0.0.1" \
		issuer_name="nginx_root_ca" \
		key_name="ca-key" \
		organization="42 Lyon Ft_transcendance Group" \
		ou="Ft_transcendance Project" \
		country="FR" \
		province="Auvergne-Rhône-Alpes" \
		locality="Lyon" \
		max_path_length=1 \
		ttl=87600h > /nginx/certs/ca/root_ca.crt
		# OU ssl certificate field is depreciated at the request of the CA/Browser Forum since August 1, 2022. So it is pointless.
	create_nginx_root_ca_role
	setup_ca_crl_urls
}

enable_nginx_pki_engine () {
	echo -e "\nNginx Root CA - Enabling PKI engine at 'nginx/' path"
	vault secrets enable -path=nginx pki #>> /dev/null
	vault secrets tune -max-lease-ttl=87600h nginx #>> /dev/null
}

#######################################
########## Intermediate CA ############
#######################################

create_nginx_intermediate_ca_role () {
	echo -e "\nNginx Intermediate CA - Creating a role"
	vault write nginx_int/roles/nginx_intermediate_ca_role \
		issuer_ref="$(vault read -field=default nginx_int/config/issuers)" \
		allowed_domains="$NGINX_ALT_NAMES" \
		allow_subdomains=true \
		allow_bare_domains=true \
		organization="42 Lyon Ft_transcendance Group" \
		ou="Ft_transcendance Project" \
		country="FR" \
		province="Auvergne-Rhône-Alpes" \
		locality="Lyon" \
		max_ttl="2160h" >> /dev/null
}
setup_int_ca_crl_urls () {
	echo -e "\nNginx Intermediate CA - configuring CA and CRL urls"
	vault write nginx_int/config/urls \
		issuing_certificates="$VAULT_ADDR/v1/nginx_int/ca" \
		crl_distribution_points="$VAULT_ADDR/v1/nginx_int/crl"
}

generate_nginx_intermediate_ca () {
	echo -e "\nNginx Intermediate CA - generating"
	vault pki issue --issuer_name=nginx_intermediate_ca \
		/nginx/issuer/$(vault list -format=json nginx/issuers/ | jq -r '.[0]') \
		/nginx_int/ \
		common_name="Transcendance Intermediate Authority" \
		exclude_cn_from_sans=true \
		alt_names="$NGINX_ALT_NAMES" \
		permitted_dns_domains="$NGINX_ALT_NAMES" \
		ip_sans="127.0.0.1" \
		issuer_name="nginx_root_ca" \
		key_name="ca-key" \
		organization="42 Lyon Ft_transcendance Group" \
		ou="Ft_transcendance Project" \
		country="FR" \
		province="Auvergne-Rhône-Alpes" \
		locality="Lyon" \
		key_type="rsa" \
		key_bits="4096" \
		max_depth_len=1 \
		ttl="43800h" >> /dev/null
	create_nginx_intermediate_ca_role
	setup_int_ca_crl_urls
}

enable_nginxint_pki_engine () {
	echo -e "\nNginx Intermediate CA - Enabling PKI engine at 'nginx_int/' path"
	vault secrets enable -path=nginx_int pki
	vault secrets tune -max-lease-ttl=43800h nginx_int
}

#######################################
### Nginx TLS Certificates Creation ###
#######################################

request_nginx_certificate () {
	echo -e "\nNginx SSL Certificate - creating..."
	vault write -format=json nginx_int/issue/nginx_intermediate_ca_role \
		common_name="www.transcendance.fr" \
		alt_names="$NGINX_ALT_NAMES" \
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

create_nginx_tls_certs () {
	enable_nginx_pki_engine
	generate_nginx_root_ca
	enable_nginxint_pki_engine
	generate_nginx_intermediate_ca
	request_nginx_certificate
}

#######################################
############ Main Script ##############
#######################################

mkdir -p /nginx/certs/ca

if [ -s /vault/file/keys ]; then
	unseal
else
	init
	unseal
	log_in
	enable_secret_kv_engine
	create_policies
	create_postgres_password
	create_elastic_password
	create_kibana_password
	create_logstash_password
	create_logstash_es_client_password
	create_nginx_tls_certs
	create_tokens
# tail -f /dev/null
	vault token revoke -mode="orphan" $(grep 'Initial Root Token:' /vault/file/keys | awk '{print $NF}') >> /dev/null
fi

vault status > /vault/file/status

touch $HEALTHFLAG_FILE && chmod 400 $HEALTHFLAG_FILE

sleep 10s

rm -rf $HEALTHFLAG_FILE

tail -f /dev/null

#######################################
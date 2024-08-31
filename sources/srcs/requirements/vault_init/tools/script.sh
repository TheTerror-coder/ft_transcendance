#!/bin/sh

echo "************beginning of the program**********"

# tail -f /dev/null

set -e

source /etc/container-init.d/create-root-ca.sh
source /etc/container-init.d/generate-nginx-ssl-certs.sh
source /etc/container-init.d/generate-web-ssl-certs.sh

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
	curl -s --cacert $VAULT_CACERT -H "Authorization: Bearer $root_token" --data @/run/secrets/pki_access_policy_json https://vault_c:8200/v1/sys/policy/pki_access >> /dev/null
}

#######################################
############## Tokens ###############
#######################################

create_tokens () {
	vault token create -id $(cat /run/secrets/root_access_token) >> /dev/null # TODO remove in production, better get rid of root tokens for security matter
	vault token create -id $(cat /run/secrets/secret_access_token) -policy='secret_access_policy' >> /dev/null
	vault token create -id $(cat /run/secrets/pki_access_token) -policy='pki_access' >> /dev/null
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
######## Create certificates ##########
#######################################

create_nginx_tls_certs () {
	enable_root_ca_pki_engine
	generate_root_ca
	
	enable_nginx_pki_engine
	generate_nginx_intermediate_ca
	request_nginx_certificate
	
	enable_web_pki_engine
	generate_web_intermediate_ca
	request_web_certificate
}

#######################################
############ Main Script ##############
#######################################

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

tail -f /dev/null

#######################################
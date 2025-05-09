#!/bin/sh 

set -e

echo "************beginning of the program**********"

source $VAULT_HOME/container-init.d/create-root-ca.sh
source $VAULT_HOME/container-init.d/generate-nginx-ssl-certs.sh
source $VAULT_HOME/container-init.d/generate-backend-ssl-certs.sh
source $VAULT_HOME/container-init.d/generate-gameserver-ssl-certs.sh
source $VAULT_HOME/container-init.d/generate-redis-ssl-certs.sh
source $VAULT_HOME/container-init.d/vault-ssl.sh

init () {
	echo -e "\nVault - initializing the server..."
	vault operator init > $VAULT_HOME/volumes/vault/file/keys
}

unseal () {
	echo -e "\nVault - unsealing vault..."
	vault operator unseal $(grep 'Key 1:' $VAULT_HOME/volumes/vault/file/keys | awk '{print $NF}')
	vault operator unseal $(grep 'Key 2:' $VAULT_HOME/volumes/vault/file/keys | awk '{print $NF}')
	vault operator unseal $(grep 'Key 3:' $VAULT_HOME/volumes/vault/file/keys | awk '{print $NF}')
}

log_in () {
	root_token=$(grep 'Initial Root Token:' $VAULT_HOME/volumes/vault/file/keys | awk '{print $NF}')
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
	root_token=$(grep 'Initial Root Token:' $VAULT_HOME/volumes/vault/file/keys | awk '{print $NF}')
	curl -s --cacert $VAULT_CACERT -H "Authorization: Bearer $root_token" --data @$VAULT_HOME/secrets/password_policy_json https://vault_c:$VAULT_API_PORT/v1/sys/policies/password/password_policy >> /dev/null
	curl -s --cacert $VAULT_CACERT -H "Authorization: Bearer $root_token" --data @$VAULT_HOME/secrets/secret_access_policy_json https://vault_c:$VAULT_API_PORT/v1/sys/policy/secret_access_policy >> /dev/null
	curl -s --cacert $VAULT_CACERT -H "Authorization: Bearer $root_token" --data @$VAULT_HOME/secrets/pki_access_policy_json https://vault_c:$VAULT_API_PORT/v1/sys/policy/pki_access >> /dev/null
}

#######################################
############## Tokens ###############
#######################################

create_tokens () {
	vault token create -id $ROOT_ACCESS_TOKEN >> /dev/null # TODO remove in production, better get rid of root tokens for security matter
	vault token create -id $SECRET_ACCESS_TOKEN -policy='secret_access_policy' >> /dev/null
	vault token create -id $PKI_ACCESS_TOKEN -policy='pki_access' >> /dev/null
}

#######################################
############## Postgres ###############
#######################################

create_postgres_password () {
	root_token=$(grep 'Initial Root Token:' $VAULT_HOME/volumes/vault/file/keys | awk '{print $NF}')
	postgres_password=$(curl -s --cacert $VAULT_CACERT -H "Authorization: Bearer $root_token" https://vault_c:$VAULT_API_PORT/v1/sys/policies/password/password_policy/generate | jq .data.password)
	payload=$(echo {  \"options\": {    \"cas\": 0  },  \"data\": {    \"password\": $postgres_password }})
	curl -s --cacert $VAULT_CACERT  -H "Authorization: Bearer $root_token" --data "$payload" https://vault_c:$VAULT_API_PORT/v1/secret/data/postgres #>> /dev/null
}

#######################################
############## Elastic ################
#######################################

create_elastic_password () {
	root_token=$(grep 'Initial Root Token:' $VAULT_HOME/volumes/vault/file/keys | awk '{print $NF}')
	elastic_password=$(curl -s --cacert $VAULT_CACERT -H "Authorization: Bearer $root_token" https://vault_c:$VAULT_API_PORT/v1/sys/policies/password/password_policy/generate | jq .data.password)
	payload=$(echo {  \"options\": {    \"cas\": 0  },  \"data\": {    \"password\": $elastic_password }})
	curl -s --cacert $VAULT_CACERT  -H "Authorization: Bearer $root_token" --data "$payload" https://vault_c:$VAULT_API_PORT/v1/secret/data/elastic #>> /dev/null
}

#######################################
############### Kibana ################
#######################################

create_kibana_password () {
	root_token=$(grep 'Initial Root Token:' $VAULT_HOME/volumes/vault/file/keys | awk '{print $NF}')
	kibana_password=$(curl -s --cacert $VAULT_CACERT -H "Authorization: Bearer $root_token" https://vault_c:$VAULT_API_PORT/v1/sys/policies/password/password_policy/generate | jq .data.password)
	payload=$(echo {  \"options\": {    \"cas\": 0  },  \"data\": {    \"password\": $kibana_password }})
	curl -s --cacert $VAULT_CACERT  -H "Authorization: Bearer $root_token" --data "$payload" https://vault_c:$VAULT_API_PORT/v1/secret/data/kibana #>> /dev/null
}

#######################################
############# Logstash ################
#######################################

create_logstash_password () {
	root_token=$(grep 'Initial Root Token:' $VAULT_HOME/volumes/vault/file/keys | awk '{print $NF}')
	logstash_password=$(curl -s --cacert $VAULT_CACERT -H "Authorization: Bearer $root_token" https://vault_c:$VAULT_API_PORT/v1/sys/policies/password/password_policy/generate | jq .data.password)
	payload=$(echo {  \"options\": {    \"cas\": 0  },  \"data\": {    \"password\": $logstash_password }})
	curl -s --cacert $VAULT_CACERT  -H "Authorization: Bearer $root_token" --data "$payload" https://vault_c:$VAULT_API_PORT/v1/secret/data/logstash #>> /dev/null
}

create_logstash_es_client_password () {
	root_token=$(grep 'Initial Root Token:' $VAULT_HOME/volumes/vault/file/keys | awk '{print $NF}')
	logstash_es_client_password=$(curl -s --cacert $VAULT_CACERT -H "Authorization: Bearer $root_token" https://vault_c:$VAULT_API_PORT/v1/sys/policies/password/password_policy/generate | jq .data.password)
	payload=$(echo {  \"options\": {    \"cas\": 0  },  \"data\": {    \"password\": $logstash_es_client_password }})
	curl -s --cacert $VAULT_CACERT  -H "Authorization: Bearer $root_token" --data "$payload" https://vault_c:$VAULT_API_PORT/v1/secret/data/logstash_es_client #>> /dev/null
}

#######################################
#############  redis   ################
#######################################

create_redis_default_password () {
	root_token=$(grep 'Initial Root Token:' $VAULT_HOME/volumes/vault/file/keys | awk '{print $NF}')
	redis_password=$(curl -s --cacert $VAULT_CACERT -H "Authorization: Bearer $root_token" https://vault_c:$VAULT_API_PORT/v1/sys/policies/password/password_policy/generate | jq .data.password)
	payload=$(echo {  \"options\": {    \"cas\": 0  },  \"data\": {    \"password\": $redis_password }})
	curl -s --cacert $VAULT_CACERT  -H "Authorization: Bearer $root_token" --data "$payload" https://vault_c:$VAULT_API_PORT/v1/secret/data/redis_default #>> /dev/null
}

create_redis_onepong_password () {
	root_token=$(grep 'Initial Root Token:' $VAULT_HOME/volumes/vault/file/keys | awk '{print $NF}')
	redis_password=$(curl -s --cacert $VAULT_CACERT -H "Authorization: Bearer $root_token" https://vault_c:$VAULT_API_PORT/v1/sys/policies/password/password_policy/generate | jq .data.password)
	payload=$(echo {  \"options\": {    \"cas\": 0  },  \"data\": {    \"password\": $redis_password }})
	curl -s --cacert $VAULT_CACERT  -H "Authorization: Bearer $root_token" --data "$payload" https://vault_c:$VAULT_API_PORT/v1/secret/data/redis_onepong #>> /dev/null
}

#######################################
######### backpong admin ##############
#######################################

create_backpong_admin_password () {
	root_token=$(grep 'Initial Root Token:' $VAULT_HOME/volumes/vault/file/keys | awk '{print $NF}')
	payload=$(echo {  \"options\": {    \"cas\": 0  },  \"data\": {    \"password\": \"$PONGADMIN_PASS\" }})
	curl -s --cacert $VAULT_CACERT  -H "Authorization: Bearer $root_token" --data "$payload" https://vault_c:$VAULT_API_PORT/v1/secret/data/backpong_admin #>> /dev/null
}

#######################################
###      backend secret key         ###
#######################################

create_backend_secret_key () {
	root_token=$(grep 'Initial Root Token:' $VAULT_HOME/volumes/vault/file/keys | awk '{print $NF}')
	payload=$(echo {  \"options\": {    \"cas\": 0  },  \"data\": {    \"password\": \"$BACKEND_SECRET_KEY\" }})
	curl -s --cacert $VAULT_CACERT  -H "Authorization: Bearer $root_token" --data "$payload" https://vault_c:$VAULT_API_PORT/v1/secret/data/backend_secret_key #>> /dev/null
}

#######################################
###       gameserver secret key     ###
#######################################

create_gameserver_secret_key () {
	root_token=$(grep 'Initial Root Token:' $VAULT_HOME/volumes/vault/file/keys | awk '{print $NF}')
	payload=$(echo {  \"options\": {    \"cas\": 0  },  \"data\": {    \"password\": \"$GAMESERVER_SECRET_KEY\" }})
	curl -s --cacert $VAULT_CACERT  -H "Authorization: Bearer $root_token" --data "$payload" https://vault_c:$VAULT_API_PORT/v1/secret/data/gameserver_secret_key #>> /dev/null
}

#######################################
######## Create certificates ##########
#######################################

set_tls_volumes_permissions(){
	echo "Setting Nginx's TLS files permissions..."
	find $VAULT_HOME/volumes/nginx/certs -type d -exec chmod 750 \{\} \;;
	find $VAULT_HOME/volumes/nginx/certs -type f -exec chmod 640 \{\} \;;
	chown -R $VAULT_UID:$SHARED_GID $VAULT_HOME/volumes/nginx/certs;
	echo "Nginx's TLS files permissions Done!"
	
	echo "Setting Backend's TLS files permissions..."
	find $VAULT_HOME/volumes/backend/certs -type d -exec chmod 750 \{\} \;;
	find $VAULT_HOME/volumes/backend/certs -type f -exec chmod 640 \{\} \;;
	chown -R $VAULT_UID:$SHARED_GID $VAULT_HOME/volumes/backend/certs;
	echo "Backend's TLS files permissions Done!"

	echo "Setting GameServer's TLS files permissions..."
	find $VAULT_HOME/volumes/gameserver/certs -type d -exec chmod 750 \{\} \;;
	find $VAULT_HOME/volumes/gameserver/certs -type f -exec chmod 640 \{\} \;;
	chown -R $VAULT_UID:$SHARED_GID $VAULT_HOME/volumes/gameserver/certs;
	echo "GameServer's TLS files permissions Done!"
	
	echo "Setting Redis's TLS files permissions..."
	find $VAULT_HOME/volumes/redis/certs -type d -exec chmod 750 \{\} \;;
	find $VAULT_HOME/volumes/redis/certs -type f -exec chmod 640 \{\} \;;
	chown -R $VAULT_UID:$SHARED_GID $VAULT_HOME/volumes/redis/certs;
	echo "Redis's TLS files permissions Done!"
}

create_tls_certs () {
	enable_root_ca_pki_engine
	generate_root_ca
	
	enable_nginx_pki_engine
	generate_nginx_intermediate_ca
	request_nginx_certificate
	
	enable_backend_pki_engine
	generate_backend_intermediate_ca
	request_backend_certificate
	
	enable_gameserver_pki_engine
	generate_gameserver_intermediate_ca
	request_gameserver_certificate
	
	enable_redis_pki_engine
	generate_redis_intermediate_ca
	request_redis_certificate
	
	set_tls_volumes_permissions
}

#######################################
############ Main Script ##############
#######################################

if [ -s $VAULT_HOME/volumes/vault/certs/ca/ca.crt ] && [ -s $VAULT_HOME/volumes/vault/certs/vault.crt ] && [ -s $VAULT_HOME/volumes/vault/certs/vault.key ]; then
	echo "vault tls certificates already exist!"
	echo "[INFO] Clean the holding volume and restart the container to update/recreate them."
else
	generate_vault_tls_certificates
fi

touch $HEALTHFLAG_FILE && chmod 400 $HEALTHFLAG_FILE

echo "Waiting for vault server starting up...";
	until curl -s --cacert $VAULT_CACERT https://vault_c:$VAULT_API_PORT | grep 'Temporary Redirect'; do sleep 10; done;
echo "Waiting Done!";

if [ -s $VAULT_HOME/volumes/vault/file/keys ]; then
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
	create_redis_default_password
	create_redis_onepong_password
	create_backpong_admin_password
	create_backend_secret_key
	create_gameserver_secret_key
	create_tls_certs
	create_tokens
	vault token revoke -mode="orphan" $(grep 'Initial Root Token:' $VAULT_HOME/volumes/vault/file/keys | awk '{print $NF}') >> /dev/null
fi

vault status > $VAULT_HOME/volumes/vault/file/status

touch $VAULT_INIT_HEALTHFLAG && chmod 400 $VAULT_INIT_HEALTHFLAG

echo "All done!";

tail -f /dev/null

#######################################
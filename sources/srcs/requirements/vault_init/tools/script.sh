#!/bin/sh

echo "************beginning of the program**********"

# tail -f /dev/null

set -e

init () {
	vault operator init > /vault/file/keys
}

unseal () {
	vault operator unseal $(grep 'Key 1:' /vault/file/keys | awk '{print $NF}')
	vault operator unseal $(grep 'Key 2:' /vault/file/keys | awk '{print $NF}')
	vault operator unseal $(grep 'Key 3:' /vault/file/keys | awk '{print $NF}')
}

log_in () {
	root_token=$(grep 'Initial Root Token:' /vault/file/keys | awk '{print $NF}')
	vault login $root_token >> /vault/file/script.log
}

create_token () {
	vault token create -id $(cat /run/secrets/root_access_token) >> /vault/file/script.log
}

create_token_policies () {
	root_token=$(grep 'Initial Root Token:' /vault/file/keys | awk '{print $NF}')
	curl -s --cacert $VAULT_CACERT -H "Authorization: Bearer $root_token" --data @/run/secrets/secret_access_policy_json https://vault_c:8200/v1/sys/policy/secret_access_policy >> /vault/file/script.log
}

create_secret_access_token () {
	vault token create -id $(cat /run/secrets/secret_access_token) -policy='secret_access_policy' >> /vault/file/script.log
}

# enable_unseal_kv_engine () {
# 	vault secrets enable -path=unseal -version=1 kv >> /vault/file/script.log
# }

# save_unseal_keys () {
# 	root_token=$(grep 'Initial Root Token:' /vault/file/keys | awk '{print $NF}')
# 	key1=$(grep 'Key 1:' /vault/file/keys | awk '{print $NF}')
# 	key2=$(grep 'Key 2:' /vault/file/keys | awk '{print $NF}')
# 	key3=$(grep 'Key 3:' /vault/file/keys | awk '{print $NF}')
# 	key4=$(grep 'Key 4:' /vault/file/keys | awk '{print $NF}')
# 	key5=$(grep 'Key 5:' /vault/file/keys | awk '{print $NF}')
# 	payload1=$(echo {  \"options\": {    \"cas\": 0  },  \"data\": {    \"key1\": \"$key1\" }})
# 	payload2=$(echo {  \"options\": {    \"cas\": 0  },  \"data\": {    \"key1\": \"$key2\" }})
# 	payload3=$(echo {  \"options\": {    \"cas\": 0  },  \"data\": {    \"key1\": \"$key3\" }})
# 	payload4=$(echo {  \"options\": {    \"cas\": 0  },  \"data\": {    \"key1\": \"$key4\" }})
# 	payload5=$(echo {  \"options\": {    \"cas\": 0  },  \"data\": {    \"key1\": \"$key5\" }})
# 	curl -s --cacert $VAULT_CACERT  -H "Authorization: Bearer $root_token" --data "$payload1" https://vault_c:8200/v1/unseal/key1 >> /vault/file/script.log
# 	curl -s --cacert $VAULT_CACERT  -H "Authorization: Bearer $root_token" --data "$payload2" https://vault_c:8200/v1/unseal/key2 >> /vault/file/script.log
# 	curl -s --cacert $VAULT_CACERT  -H "Authorization: Bearer $root_token" --data "$payload3" https://vault_c:8200/v1/unseal/key3 >> /vault/file/script.log
# 	curl -s --cacert $VAULT_CACERT  -H "Authorization: Bearer $root_token" --data "$payload4" https://vault_c:8200/v1/unseal/key4 >> /vault/file/script.log
# 	curl -s --cacert $VAULT_CACERT  -H "Authorization: Bearer $root_token" --data "$payload5" https://vault_c:8200/v1/unseal/key5 >> /vault/file/script.log
# }

enable_secret_kv_engine () {
	vault secrets enable -path=secret -version=2 kv >> /vault/file/script.log
}

create_password_policy () {
	root_token=$(grep 'Initial Root Token:' /vault/file/keys | awk '{print $NF}')
	curl -s --cacert $VAULT_CACERT -H "Authorization: Bearer $root_token" --data @/run/secrets/password_policy_json https://vault_c:8200/v1/sys/policies/password/password_policy >> /vault/file/script.log
}

create_postgres_password () {
	root_token=$(grep 'Initial Root Token:' /vault/file/keys | awk '{print $NF}')
	postgres_password=$(curl -s --cacert $VAULT_CACERT -H "Authorization: Bearer $root_token" https://vault_c:8200/v1/sys/policies/password/password_policy/generate | jq .data.password)
	payload=$(echo {  \"options\": {    \"cas\": 0  },  \"data\": {    \"password\": $postgres_password }})
	curl -s --cacert $VAULT_CACERT  -H "Authorization: Bearer $root_token" --data "$payload" https://vault_c:8200/v1/secret/data/postgres >> /vault/file/script.log
}

create_elastic_password () {
	root_token=$(grep 'Initial Root Token:' /vault/file/keys | awk '{print $NF}')
	elastic_password=$(curl -s --cacert $VAULT_CACERT -H "Authorization: Bearer $root_token" https://vault_c:8200/v1/sys/policies/password/password_policy/generate | jq .data.password)
	payload=$(echo {  \"options\": {    \"cas\": 0  },  \"data\": {    \"password\": $elastic_password }})
	curl -s --cacert $VAULT_CACERT  -H "Authorization: Bearer $root_token" --data "$payload" https://vault_c:8200/v1/secret/data/elastic >> /vault/file/script.log
}

create_kibana_password () {
	root_token=$(grep 'Initial Root Token:' /vault/file/keys | awk '{print $NF}')
	kibana_password=$(curl -s --cacert $VAULT_CACERT -H "Authorization: Bearer $root_token" https://vault_c:8200/v1/sys/policies/password/password_policy/generate | jq .data.password)
	payload=$(echo {  \"options\": {    \"cas\": 0  },  \"data\": {    \"password\": $kibana_password }})
	curl -s --cacert $VAULT_CACERT  -H "Authorization: Bearer $root_token" --data "$payload" https://vault_c:8200/v1/secret/data/kibana >> /vault/file/script.log
}

create_logstash_password () {
	root_token=$(grep 'Initial Root Token:' /vault/file/keys | awk '{print $NF}')
	logstash_password=$(curl -s --cacert $VAULT_CACERT -H "Authorization: Bearer $root_token" https://vault_c:8200/v1/sys/policies/password/password_policy/generate | jq .data.password)
	payload=$(echo {  \"options\": {    \"cas\": 0  },  \"data\": {    \"password\": $logstash_password }})
	curl -s --cacert $VAULT_CACERT  -H "Authorization: Bearer $root_token" --data "$payload" https://vault_c:8200/v1/secret/data/logstash >> /vault/file/script.log
}

create_logstash_es_client_password () {
	root_token=$(grep 'Initial Root Token:' /vault/file/keys | awk '{print $NF}')
	logstash_es_client_password=$(curl -s --cacert $VAULT_CACERT -H "Authorization: Bearer $root_token" https://vault_c:8200/v1/sys/policies/password/password_policy/generate | jq .data.password)
	payload=$(echo {  \"options\": {    \"cas\": 0  },  \"data\": {    \"password\": $logstash_es_client_password }})
	curl -s --cacert $VAULT_CACERT  -H "Authorization: Bearer $root_token" --data "$payload" https://vault_c:8200/v1/secret/data/logstash_es_client >> /vault/file/script.log
}

if [ -s /vault/file/keys ]; then
	unseal
else
	init
	unseal
	log_in
	enable_secret_kv_engine
	# enable_unseal_kv_engine
	# save_unseal_keys
	create_password_policy
	create_postgres_password
	create_elastic_password
	create_kibana_password
	create_logstash_password
	create_logstash_es_client_password
	create_token
	create_token_policies
	create_secret_access_token
	vault token revoke -mode="orphan" $(grep 'Initial Root Token:' /vault/file/keys | awk '{print $NF}') >> /vault/file/script.log
	rm -rf /vault/file/script.log
	# sed -i '/Key /d' vault/file/keys
	# sed -i '/Initial Root Token/d' vault/file/keys
fi

vault status > /vault/file/status

touch $HEALTHFLAG_FILE && chmod 400 $HEALTHFLAG_FILE

sleep 10s

rm -rf $HEALTHFLAG_FILE

tail -f /dev/null

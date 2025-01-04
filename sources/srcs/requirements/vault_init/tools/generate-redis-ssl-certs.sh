#!/bin/bash

#######################################
###### Redis Intermediate CA ##########
#######################################

create_redis_intermediate_ca_role () {
	echo -e "\nRedis Intermediate CA - Creating a role"
	vault write redis/roles/redis_intermediate_ca_role \
		issuer_ref="$(vault read -field=default redis/config/issuers)" \
		allowed_domains="$REDIS_ALT_NAMES" \
		allow_subdomains=true \
		allow_bare_domains=true \
		organization="42 Lyon Ft_transcendance Group" \
		ou="Ft_transcendance Project Unit" \
		country="FR" \
		province="Auvergne-Rhône-Alpes" \
		locality="Lyon" \
		max_ttl="2160h" >> /dev/null
}

setup_redis_intermediate_ca_crl_urls () {
	echo -e "\nRedis Intermediate CA - configuring CA and CRL urls"
	vault write redis/config/urls \
		issuing_certificates="$VAULT_ADDR/v1/redis/ca" \
		crl_distribution_points="$VAULT_ADDR/v1/redis/crl"
}

generate_redis_intermediate_ca () {
	echo -e "\nRedis Intermediate CA - generating"
	vault pki issue --issuer_name="Redis-Intermediate-CA" \
		/root-ca/issuer/$(vault list -format=json root-ca/issuers/ | jq -r '.[0]') \
		/redis/ \
		common_name="Transcendance Intermediate Authority" \
		exclude_cn_from_sans=true \
		alt_names="$REDIS_ALT_NAMES" \
		permitted_dns_domains="$REDIS_ALT_NAMES" \
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
	create_redis_intermediate_ca_role
	setup_redis_intermediate_ca_crl_urls
}

enable_redis_pki_engine () {
	echo -e "\nRedis Intermediate CA - Enabling PKI engine at 'redis/' path"
	vault secrets enable -path=redis pki
	vault secrets tune -max-lease-ttl=43800h redis
}

#######################################
### Redis TLS Certificates Creation ###
#######################################

request_redis_certificate () {
	mkdir -p $VAULT_HOME/volumes/redis/certs/ca

	echo -e "\nRedis SSL Certificate - creating..."
	curl -s --cacert $VAULT_CACERT $VAULT_ADDR/v1/root-ca/ca/pem --output $VAULT_HOME/volumes/redis/certs/ca/root_ca.crt
	vault write -format=json redis/issue/redis_intermediate_ca_role \
		common_name="redis" \
		alt_names="$REDIS_ALT_NAMES" \
		ip_sans="$HOST_IP" \
		exclude_cn_from_sans=true \
		ttl="720h" \
		| tee \
		>(jq -r .data.certificate > $VAULT_HOME/volumes/redis/certs/redis.crt) \
		>(jq -r .data.issuing_ca > $VAULT_HOME/volumes/redis/certs/ca/ca.crt) \
		>(jq -r .data.private_key > $VAULT_HOME/volumes/redis/certs/redis.key) \
		> /dev/null
	cat $VAULT_HOME/volumes/redis/certs/ca/ca.crt >> $VAULT_HOME/volumes/redis/certs/redis.crt
	cat $VAULT_HOME/volumes/redis/certs/ca/root_ca.crt >> $VAULT_HOME/volumes/redis/certs/redis.crt
	if [ -s $VAULT_HOME/volumes/redis/certs/redis.crt ] || [ -s $VAULT_HOME/volumes/redis/certs/redis.key ]; then
		echo -e "Redis SSL Certificate - done!"
	else
		echo -e "Redis SSL Certificate - creation went wrong!"
	fi
}

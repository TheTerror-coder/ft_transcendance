#!/bin/sh

set -e

generate_vault_tls_certificates() {
	echo "Creating Vault's TLS CA"
	openssl genrsa -out /vault/certs/ca/ca.key 2048
	openssl req -x509 -new -nodes -key /vault/certs/ca/ca.key -sha256 -days 365 -out /vault/certs/ca/ca.crt -config /vault/vault_ssl.cnf -extensions v3_ca -subj "/CN=localhost"
	
	echo "Creating Vault's TLS Certificates"
	openssl genrsa -out /vault/certs/vault.key 2048
	openssl req -new -key /vault/certs/vault.key -out /vault/certs/vault.csr -config /vault/vault_ssl.cnf -extensions v3_req
	openssl x509 -req -in /vault/certs/vault.csr -CA /vault/certs/ca/ca.crt -CAkey /vault/certs/ca/ca.key -CAcreateserial -out /vault/certs/vault.crt -days 365 -sha256 -extfile /vault/vault_ssl.cnf -extensions v3_req
	# openssl pkcs12 -export -out /vault/certs/vault.pfx -inkey /vault/certs/vault.key -in /vault/certs/vault.crt -certfile /vault/certs/ca/ca.crt -passout pass:
	
	echo "Setting Vault's TLS certificate files permissions"
	chown -R 100:1000 vault;
	find /vault/ -type d -exec chmod 750 \{\} \;;
	find /vault/ -type f -exec chmod 640 \{\} \;;
}

generate_nginx_tls_certificates() {
	echo "Creating nginx's TLS CA"
	openssl genrsa -out /nginx/certs/ca/ca.key 2048
	openssl req -x509 -new -nodes -key /nginx/certs/ca/ca.key -sha256 -days 365 -out /nginx/certs/ca/ca.crt -config /nginx/nginx_ssl.cnf -extensions v3_ca -subj "/CN=localhost"
	
	echo "Creating nginx's TLS Certificates"
	openssl genrsa -out /nginx/certs/nginx.key 2048
	openssl req -new -key /nginx/certs/nginx.key -out /nginx/certs/nginx.csr -config /nginx/nginx_ssl.cnf -extensions v3_req
	openssl x509 -req -in /nginx/certs/nginx.csr -CA /nginx/certs/ca/ca.crt -CAkey /nginx/certs/ca/ca.key -CAcreateserial -out /nginx/certs/nginx.crt -days 365 -sha256 -extfile /nginx/nginx_ssl.cnf -extensions v3_req
	# openssl pkcs12 -export -out /nginx/certs/nginx.pfx -inkey /nginx/certs/nginx.key -in /nginx/certs/nginx.crt -certfile /nginx/certs/ca/ca.crt -passout pass:
	
	echo "Setting nginx's TLS certificate files permissions"
	chown -R 101:101 nginx;
	find /nginx/ -type d -exec chmod 750 \{\} \;;
	find /nginx/ -type f -exec chmod 640 \{\} \;;
}

mkdir -p /vault/certs/ca /nginx/certs/ca

if [ -s /vault/certs/ca/ca.crt ] && [ -s /vault/certs/vault.crt ] && [ -s /vault/certs/vault.key ]; then
	echo "vault tls certificates already exist!"
	echo "[INFO] Clean the holding volume and restart the container to update/recreate them."
else
	generate_vault_tls_certificates
fi

if [ -s /nginx/certs/ca/ca.crt ] && [ -s /nginx/certs/nginx.crt ] && [ -s /nginx/certs/nginx.key ]; then
	echo "nginx tls certificates already exist!"
	echo "[INFO] Clean the holding volume and restart the container to update/recreate them."
else
	generate_nginx_tls_certificates
fi

touch $HEALTHFLAG_FILE && chmod 400 $HEALTHFLAG_FILE

echo "All done!";

sleep 10s

rm -rf $HEALTHFLAG_FILE

tail -f /dev/null # TODO remove


# bash -c '
# 	if [ x$(cat $ELASTIC_PASSWORD_FILE) == x ]; then
# 		echo "Set the ELASTIC_PASSWORD_FILE environment variable in the .env file";
# 		exit 1;
# 	elif [ x$( cat $KIBANA_PASSWORD_FILE) == x ]; then
# 		echo "Set the KIBANA_PASSWORD_FILE environment variable in the .env file";
# 		exit 1;
# 	fi;
# 	if [ ! -f config/certs/ca.zip ]; then
# 		echo "Creating CA";
# 		mkdir -p /usr/share/elasticsearch/config/certs
# 		bin/elasticsearch-certutil ca --silent --pem -out config/certs/ca.zip;
# 		unzip config/certs/ca.zip -d config/certs;
# 	fi;
# 	if [ ! -f config/certs/certs.zip ]; then
# 		echo "Creating certs";
# 		echo -ne \
# 		"instances:\n"\
# 		"  - name: elasticsearch\n"\
# 		"    dns:\n"\
# 		"      - elasticsearch\n"\
# 		"      - localhost\n"\
# 		"    ip:\n"\
# 		"      - 127.0.0.1\n"\
# 		> config/certs/instances.yml;
# 		bin/elasticsearch-certutil cert --silent --pem -out config/certs/certs.zip --in config/certs/instances.yml --ca-cert config/certs/ca/ca.crt --ca-key config/certs/ca/ca.key;
# 		unzip config/certs/certs.zip -d config/certs;
# 		openssl pkcs8 -inform PEM -in config/certs/elasticsearch/elasticsearch.key -topk8 -nocrypt -outform PEM -out config/certs/elasticsearch/elasticsearch.pkcs8.key
# 	fi;

# 	echo "Setting file permissions"
# 	chown -R root:root config/certs;
# 	find . -type d -exec chmod 750 \{\} \;;
# 	find . -type f -exec chmod 640 \{\} \;;

# 	echo "Waiting for Elasticsearch availability";
# 	until curl -s --cacert config/certs/ca/ca.crt ${ELASTICSEARCH_HOSTXPORT} | grep -q "missing authentication credentials"; do sleep 30; done;
	
# 	echo "Setting ${KIBANA_USER} password";
# 	until curl -s -X POST --cacert config/certs/ca/ca.crt -u "${ELASTIC_USER}:$(cat $ELASTIC_PASSWORD_FILE)" -H "Content-Type: application/json" ${ELASTICSEARCH_HOSTXPORT}/_security/user/${KIBANA_USER}/_password -d "{\"password\":\"$(cat $KIBANA_PASSWORD_FILE)\"}" | grep -q "^{}"; do sleep 10; done;
	
# 	echo "creating logstash_writer role";
# 	curl -s -X POST --cacert config/certs/ca/ca.crt \
# 		-u "${ELASTIC_USER}:$(cat $ELASTIC_PASSWORD_FILE)" \
# 		-H "Content-Type: application/json" \
# 		${ELASTICSEARCH_HOSTXPORT}/_security/role/${LOGSTASH_ES_ROLE} \
# 		-d "{ \
# 			\"cluster\": [\"manage_index_templates\", \"monitor\"], \
# 			\"indices\": [ \
# 				{ \
# 				\"names\": [ \"logstash-*\" ], \
# 				\"privileges\": [\"write\",\"create\",\"create_index\"] \
# 				} \
# 			] \
# 		}"

# 	echo "creating logstash_internal user";
# 	curl -s -X POST --cacert config/certs/ca/ca.crt \
# 		-u "${ELASTIC_USER}:$(cat $ELASTIC_PASSWORD_FILE)" \
# 		-H "Content-Type: application/json" \
# 		${ELASTICSEARCH_HOSTXPORT}/_security/user/${LOGSTASH_ES_USER} \
# 		-d "{ \
# 			\"password\" : \"$(cat $LOGSTASH_ES_USER_PASSWORD_FILE)\", \
# 			\"roles\" : [ \"${LOGSTASH_ES_ROLE}\" ], \
# 			\"full_name\" : \"${LOGSTASH_ES_USERFULLNAME}\" \
# 		}"

# 	echo "All done!";
# '
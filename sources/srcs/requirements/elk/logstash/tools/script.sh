#!/bin/bash

set -e

if [ -e /usr/share/logstash/config/certs/logstash/logstash.p12 ]; then
	echo "Logstash PKCS12 keystore already exists!"
else
	echo "Creating PKCS12 keystore the Logstash API..."
	openssl pkcs12 -export -noiter -nomaciter \
		-in config/certs/logstash/logstash.crt -name "logstash-alias" \
		-inkey config/certs/logstash/logstash.key \
		-out config/certs/logstash/logstash.p12 \
		-passout pass:$(cat $SSL_KEYSTORE_PASS_FILE)
	echo "Logstash PKCS12 keystore created!"
fi

export LOGSTASH_KEYSTORE_PASS=$(cat $LOGSTASH_KEYSTORE_PASS_FILE)

if [ -e /usr/share/logstash/config/logstash.keystore ]; then
	echo "logstash-keystore already exists!"
else
	echo "logstash-keystore creation..."
	/usr/share/logstash/bin/logstash-keystore create
	echo -e "logstash-keystore created!"
	cat $LOGSTASH_ES_USER_PASSWORD_FILE | /usr/share/logstash/bin/logstash-keystore add LOGSTASH_ES_USER_PASSWORD_KEYSTORE
	cat $ELASTIC_PASSWORD_FILE | /usr/share/logstash/bin/logstash-keystore add ELASTIC_PASSWORD_KEYSTORE
	cat $SSL_KEYSTORE_PASS_FILE | /usr/share/logstash/bin/logstash-keystore add SSL_KEYSTORE_PASSWORD
fi

cat config/my-logstash.yml > config/logstash.yml

/usr/local/bin/docker-entrypoint

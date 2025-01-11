#!/bin/bash -e

if [ -e /usr/share/logstash/config/certs/logstash/logstash.p12 ]; then
	echo "Logstash PKCS12 keystore already exists!"
else
	echo "Creating PKCS12 keystore the Logstash API..."
	openssl pkcs12 -export -noiter -nomaciter \
		-in config/certs/logstash/logstash.crt -name "logstash-alias" \
		-inkey config/certs/logstash/logstash.key \
		-out config/certs/logstash/logstash.p12 \
		-passout pass:$SECRET_SSL_KEYSTORE_PASS
	echo "Logstash PKCS12 keystore created!"
fi

export LOGSTASH_KEYSTORE_PASS=$SECRET_LOGSTASH_KEYSTORE_PASS

if [ -e /usr/share/logstash/config/logstash.keystore ]; then
	echo "logstash-keystore already exists!"
else
	echo "logstash-keystore creation..."
	/usr/share/logstash/bin/logstash-keystore create
	echo -e "logstash-keystore created!"
	echo $SECRET_LOGSTASH_ES_USER_PASSWORD | /usr/share/logstash/bin/logstash-keystore add LOGSTASH_ES_USER_PASSWORD_KEYSTORE
	echo $ELASTIC_PASSWORD | /usr/share/logstash/bin/logstash-keystore add ELASTIC_PASSWORD_KEYSTORE
	echo $SECRET_SSL_KEYSTORE_PASS | /usr/share/logstash/bin/logstash-keystore add SSL_KEYSTORE_PASSWORD
fi

cat config/my-logstash.yml > config/logstash.yml

/usr/local/bin/docker-entrypoint

#!/bin/bash -e

essentials_checking() {
	if [ x$ELASTIC_PASSWORD == x ]; then
		echo "Set the ELASTIC_PASSWORD environment variable in the .env file";
		exit 1;
	elif [ x$SECRET_KIBANA_PASSWORD == x ]; then
		echo "Set the SECRET_KIBANA_PASSWORD environment variable in the .env file";
		exit 1;
	fi;
}

create_certs() {
	if [ ! -f config/certs/ca.zip ]; then
		echo "Creating CA";
		bin/elasticsearch-certutil ca --silent --pem -out config/certs/ca.zip;
		unzip config/certs/ca.zip -d config/certs;
	fi;
	if [ ! -f config/certs/certs.zip ]; then
		echo "Creating certs";
		echo -ne \
		"instances:\n"\
		"  - name: elasticsearch\n"\
		"    dns:\n"\
		"      - elasticsearch\n"\
		"      - localhost\n"\
		"    ip:\n"\
		"      - 127.0.0.1\n"\
		"  - name: kibana\n"\
		"    dns:\n"\
		"      - kibana\n"\
		"      - kibanamediator\n"\
		"      - localhost\n"\
		"    ip:\n"\
		"      - 127.0.0.1\n"\
		"  - name: logstash\n"\
		"    dns:\n"\
		"      - logstash\n"\
		"      - localhost\n"\
		"    ip:\n"\
		"      - 127.0.0.1\n"\
		> config/certs/instances.yml;
		bin/elasticsearch-certutil cert --silent --pem -out config/certs/certs.zip --in config/certs/instances.yml --ca-cert config/certs/ca/ca.crt --ca-key config/certs/ca/ca.key;
		unzip config/certs/certs.zip -d config/certs;
	fi;
}

permissions() {
	echo "Setting file/directory permissions"
	chown -R 1000:1000 config/certs;
	find . -type d -exec chmod 755 \{\} \;;
	find . -type f -exec chmod 644 \{\} \;;
}

wait_elastic() {
	echo "Waiting for Elasticsearch availability";
	until curl -s --cacert config/certs/ca/ca.crt ${ELASTICSEARCH_HOSTXPORT} | grep -q "missing authentication credentials"; do sleep 30; done;
	
	echo "Setting user ${KIBANA_USER} password";
	until curl -s -X POST --cacert config/certs/ca/ca.crt -u "${ELASTIC_USER}:$(echo $ELASTIC_PASSWORD)" -H "Content-Type: application/json" ${ELASTICSEARCH_HOSTXPORT}/_security/user/${KIBANA_USER}/_password -d "{\"password\":\"$(echo $SECRET_KIBANA_PASSWORD)\"}" | grep -q "^{}"; do sleep 10; done;
}

logstash_user() {
	echo "creating logstash_writer role";
	curl -s -X POST --cacert config/certs/ca/ca.crt \
		-u "${ELASTIC_USER}:${ELASTIC_PASSWORD}" \
		-H "Content-Type: application/json" \
		${ELASTICSEARCH_HOSTXPORT}/_security/role/${LOGSTASH_ES_ROLE} \
		-d "{ \
			\"cluster\": [\"manage_logstash_pipelines\", \"manage_index_templates\", \"monitor\", \"read_ilm\"], \
			\"indices\": [ \
				{ \
				\"names\": [ \"logstash-*\" ], \
				\"privileges\": [\"all\"] \
				} \
			] \
		}"

	echo "creating logstash_internal user";
	curl -s -X POST --cacert config/certs/ca/ca.crt \
		-u "${ELASTIC_USER}:${ELASTIC_PASSWORD}" \
		-H "Content-Type: application/json" \
		${ELASTICSEARCH_HOSTXPORT}/_security/user/${LOGSTASH_ES_USER} \
		-d "{ \
			\"password\" : \"${SECRET_LOGSTASH_ES_USER_PASSWORD}\", \
			\"roles\" : [ \"${LOGSTASH_ES_ROLE}\" ], \
			\"full_name\" : \"${LOGSTASH_ES_USERFULLNAME}\" \
		}"
}

if	! test -e $HEALTHFLAG_FILE
then
	essentials_checking
	create_certs
	permissions
	wait_elastic
	logstash_user
	echo -e "\nAll done!";
	touch $HEALTHFLAG_FILE && chmod 400 $HEALTHFLAG_FILE
else
	echo -e "\nAll is up to date!";
	sleep 15;
fi

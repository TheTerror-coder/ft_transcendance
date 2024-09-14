#!/bin/bash -e

essentials_checking() {
	if [ x$(cat $ELASTIC_PASSWORD_FILE) == x ]; then
		echo "Set the ELASTIC_PASSWORD_FILE environment variable in the .env file";
		exit 1;
	elif [ x$( cat $KIBANA_PASSWORD_FILE) == x ]; then
		echo "Set the KIBANA_PASSWORD_FILE environment variable in the .env file";
		exit 1;
	fi;
}

create_certs() {
	if [ ! -f config/certs/ca.zip ]; then
		echo "Creating CA";
		mkdir -p /usr/share/elasticsearch/config/certs
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
	chown -R root:root config/certs;
	find . -type d -exec chmod 750 \{\} \;;
	find . -type f -exec chmod 640 \{\} \;;
}

wait_elastic() {
	echo "Waiting for Elasticsearch availability";
	until curl -s --cacert config/certs/ca/ca.crt ${ELASTICSEARCH_HOSTXPORT} | grep -q "missing authentication credentials"; do sleep 30; done;
	
	echo "Setting ${KIBANA_USER} password";
	until curl -s -X POST --cacert config/certs/ca/ca.crt -u "${ELASTIC_USER}:$(cat $ELASTIC_PASSWORD_FILE)" -H "Content-Type: application/json" ${ELASTICSEARCH_HOSTXPORT}/_security/user/${KIBANA_USER}/_password -d "{\"password\":\"$(cat $KIBANA_PASSWORD_FILE)\"}" | grep -q "^{}"; do sleep 10; done;
}

logstash_user() {
	echo "creating logstash_writer role";
	curl -s -X POST --cacert config/certs/ca/ca.crt \
		-u "${ELASTIC_USER}:$(cat $ELASTIC_PASSWORD_FILE)" \
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
		-u "${ELASTIC_USER}:$(cat $ELASTIC_PASSWORD_FILE)" \
		-H "Content-Type: application/json" \
		${ELASTICSEARCH_HOSTXPORT}/_security/user/${LOGSTASH_ES_USER} \
		-d "{ \
			\"password\" : \"$(cat $LOGSTASH_ES_USER_PASSWORD_FILE)\", \
			\"roles\" : [ \"${LOGSTASH_ES_ROLE}\" ], \
			\"full_name\" : \"${LOGSTASH_ES_USERFULLNAME}\" \
		}"
}

essentials_checking
create_certs
permissions
wait_elastic
logstash_user
echo "All done!";

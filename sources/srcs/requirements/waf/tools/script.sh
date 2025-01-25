#!/bin/sh -e

< /etc/modsecurity.d/owasp-crs/rules/REQUEST-900-EXCLUSION-RULES-BEFORE-CRS.conf.example \
	envsubst '$HOST_IP $CONTAINER_HTTP_PORT $CONTAINER_HTTPS_PORT' > /etc/modsecurity.d/owasp-crs/rules/REQUEST-900-EXCLUSION-RULES-BEFORE-CRS.conf

/docker-entrypoint.sh nginx -g "daemon off;"
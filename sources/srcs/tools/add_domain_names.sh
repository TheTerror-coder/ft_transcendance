#!/bin/bash

set -e

#TODO remove useless hostnames
hostnames=(\
	transcendance.fr \
	www.transcendance.fr \
	vault.transcendance.fr \
	www.vault.transcendance.fr \
	vault_c \
	vault \
)

for h in ${hostnames[@]}; do
	if ! cat /etc/hosts | awk 'NR {print $2}' | grep -x $h > /dev/null; then
		sed -i "1i127.0.0.1	$h" /etc/hosts
	fi
done

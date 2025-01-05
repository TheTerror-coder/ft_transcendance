#!/bin/sh -e

if ifconfig | grep -q wlp; then
	HOST_IP=$(ifconfig | grep -A 3 wlp | grep 'inet ' | grep -v "127.0.0.1" | awk '{print $2}' | head -n 1)
elif ifconfig | grep -q enp; then
	HOST_IP=$(ifconfig | grep -A 3 enp | grep 'inet ' | grep -v "127.0.0.1" | awk '{print $2}' | head -n 1)
else
    # "No suitable network interface found"
	exit 1
fi

sed -i "s/^\(_HOST_IP_[[:space:]]*=\).*/\1$HOST_IP/" $1

echo "$HOST_IP"

exit 0
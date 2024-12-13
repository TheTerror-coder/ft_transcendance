#!/bin/sh -e

_IP_=$(hostname -I | awk '{print $1}')

sed -i "s/^\(_HOST_IP_[[:space:]]*=\).*/\1$_IP_/" $1

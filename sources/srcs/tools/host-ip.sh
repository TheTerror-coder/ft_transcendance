#!/bin/sh -e

sed -i "s/^\(_HOST_IP_[[:space:]]*=\).*/\1$HOST_IP/" $1

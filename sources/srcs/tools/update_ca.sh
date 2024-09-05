#!/bin/bash

set -e

sudo mkdir -p /usr/local/share/ca-certificates/vault/
sudo rm -rf /usr/local/share/ca-certificates/vault/*
sudo update-ca-certificates

sudo docker cp vault_c:/vault/certs/ca/ca.crt /usr/local/share/ca-certificates/vault/ca.crt
sudo docker cp vault_init_c:/nginx/certs/ca/ca.crt /usr/local/share/ca-certificates/nginx/ca.crt
sudo update-ca-certificates
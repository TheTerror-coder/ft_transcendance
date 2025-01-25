api_addr				= "https://localhost:$VAULT_API_PORT"
cluster_addr			= "https://localhost:$VAULT_CLUSTER_PORT"
cluster_name			= "transcendance-vault-cluster"
disable_mlock			= true #TODO: disable if possible as the container should lock memory to prevent sensitive values from being swapped to disk
ui						= true
default_lease_ttl		= "168h"
max_lease_ttl			= "720h"

listener "tcp" {
	address			= "0.0.0.0:$VAULT_API_PORT"
	tls_cert_file	= "/vault/certs/vault.crt"
	tls_key_file	= "/vault/certs/vault.key"
	### These two below lines comes to bolster the security wall of the vault server by rejecting unauthorized sources ###
	// proxy_protocol_behavior = "deny_unauthorized"
	// proxy_protocol_authorized_addrs = "localhost,172.19.0.4,172.19.0.5,172.19.0.6,172.19.0.7"
}

storage "file" {
	path		= "/vault/file"
}

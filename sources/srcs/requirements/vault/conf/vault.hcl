api_addr				= "https://localhost:8200"
cluster_addr			= "https://localhost:8201"
cluster_name			= "transcendance-vault-cluster"
// disable_mlock			= true
ui						= true
default_lease_ttl		= "168h"
max_lease_ttl			= "720h"

listener "tcp" {
	address			= "0.0.0.0:8200"
	tls_cert_file	= "/vault/certs/vault.crt"
	tls_key_file	= "/vault/certs/vault.key"
	// proxy_protocol_behavior = "deny_unauthorized"
	// proxy_protocol_authorized_addrs = "172.19.0.4"
}

storage "file" {
	path		= "/vault/file"
}

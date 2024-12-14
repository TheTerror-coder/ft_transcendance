#!/bin/sh -e

# Linux
# _IP_=$(hostname -I | awk '{print $1}')

# sed -i "s/^\(_HOST_IP_[[:space:]]*=\).*/\1$_IP_/" $1


# MacOs
_IP_=$(ifconfig | grep 'inet ' | grep -v 127.0.0.1 | awk '{print $2}' | head -n 1)

if [ -z "$1" ]; then
  echo "Erreur : aucun fichier spécifié."
  echo "Usage : $0 chemin_vers_fichier_env"
  exit 1
fi

sed -i '' "s/^\(_HOST_IP_[[:space:]]*=\).*/\1$_IP_/" "$1"

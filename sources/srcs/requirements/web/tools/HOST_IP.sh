   #!/bin/bash

  mkdir -p $PYTHON_HOME/apps/static

   # Créer le fichier de configuration JSON
   echo "{
     \"HOST_IP\": \"${HOST_IP}\"
   }" > $PYTHON_HOME/apps/static/config.json

   # Exécuter la commande passée en argument (par exemple, démarrer le serveur)
   exec "$@"
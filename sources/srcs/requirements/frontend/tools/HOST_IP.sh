   #!/bin/bash

   # Créer le fichier de configuration JSON
   echo "{
     \"HOST_IP\": \"${HOST_IP}\"
   }" > $FRONTEND_HOME/volumes/www/static/config.json

   # Exécuter la commande passée en argument (par exemple, démarrer le serveur)
   exec "$@"
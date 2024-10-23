   #!/bin/bash

   # Créer le fichier de configuration JSON
   echo "{
     \"HOST_IP\": \"${HOST_IP}\"
   }" > $WEB_HOME/apps/static/config.json

   # Exécuter la commande passée en argument (par exemple, démarrer le serveur)
   exec "$@"
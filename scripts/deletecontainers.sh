#!/bin/bash

# Trouver les conteneurs utilisant l'image "botdiscord"
containers=$(docker ps -a -q --filter "ancestor=botdiscord")

# Vérifier si des conteneurs ont été trouvés
if [ -n "$containers" ]; then
    echo "Suppression des conteneurs utilisant l'image 'botdiscord'..."
    docker rm -f $containers
    echo "Conteneurs supprimés avec succès."
else
    echo "Aucun conteneur utilisant l'image 'botdiscord' n'a été trouvé."
fi
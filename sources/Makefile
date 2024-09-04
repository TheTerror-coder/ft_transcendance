# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    Makefile                                           :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: jm <jm@student.42lyon.fr>                  +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2024/06/17 20:14:21 by jm                #+#    #+#              #
#    Updated: 2024/09/04 17:16:03 by jm               ###   ########lyon.fr    #
#                                                                              #
# **************************************************************************** #

ENV :=./srcs/.env
COMPOSE_FILE= ./srcs/docker-compose.yml 

include $(ENV)

all : build up

build b : # Build or rebuild services
	-mkdir -p $(PATHTO_WEBAPPS_DATA)
	-sudo docker compose -f $(COMPOSE_FILE) build
create cr : # Creates containers for a service
	-sudo docker compose -f $(COMPOSE_FILE) create --remove-orphans
start : # Start services
	-sudo docker compose -f $(COMPOSE_FILE) start
up : # Create and start containers
	-sudo docker compose -f $(COMPOSE_FILE) up -d
exec : # Execute a command in a running container.
	-sudo docker compose -f $(COMPOSE_FILE) exec


images im : # List images used by the created containers
	-sudo docker images
	-sudo docker compose -f $(COMPOSE_FILE) images
ls : # List running compose projects
	sudo docker compose -f $(COMPOSE_FILE) ls
ps : # List containers
	sudo docker ps -a
	sudo docker compose -f $(COMPOSE_FILE) ps -a
logs l : # View output from containers
	sudo docker compose -f $(COMPOSE_FILE) logs -f
top : # Display the running processes
	sudo docker compose -f $(COMPOSE_FILE) top


down : # Stop and remove containers, networks
	-sudo docker compose -f $(COMPOSE_FILE) down --remove-orphans
s stop : # Stop services
	-docker compose -f $(COMPOSE_FILE) stop
rm remove : # Removes stopped service containers
	-docker compose -f $(COMPOSE_FILE) rm -f
rmi : # Removes images
	-sudo docker rmi $$(sudo docker images | awk 'NR>1 {print $3}' | tr '\n' ' ')
rmv : # clean data
	-yes | sudo docker volume prune
	-sudo rm -rf $(PATHTO_WEBAPPS_DATA)*
kill k : # Force stop service containers.
	-sudo docker compose -f $(COMPOSE_FILE) kill --remove-orphans


cleanv cv : # clean all volumes
	-yes | sudo docker volume prune
	-sudo docker volume rm $$(sudo docker volume ls | awk 'NR>1 {print $2}' | tr '\n' ' ')
clean c : down rm rmi rmv
fclean fc : clean cleanv
	-yes | sudo docker system prune
reset : clean all
freset : fclean all

restart res : # Restart service containers
	-sudo docker compose -f $(COMPOSE_FILE) restart

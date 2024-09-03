# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    Makefile                                           :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: bfaure <bfaure@student.42.fr>              +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2024/06/17 20:14:21 by jm                #+#    #+#              #
#    Updated: 2024/09/03 17:54:42 by bfaure           ###   ########.fr        #
#                                                                              #
# **************************************************************************** #


COMPOSE_FILE= ./srcs/docker-compose.yml 

all : build up

build b : # Build or rebuild services
	-mkdir -p ./srcs/requirements/web/webapps
	-docker compose -f $(COMPOSE_FILE) build
create cr : # Creates containers for a service
	-docker compose -f $(COMPOSE_FILE) create --remove-orphans
start : # Start services
	-docker compose -f $(COMPOSE_FILE) start
up : # Create and start containers
	-docker compose -f $(COMPOSE_FILE) up -d
exec : # Execute a command in a running container.
	-docker compose -f $(COMPOSE_FILE) exec


images im : # List images used by the created containers
	-docker images
	-docker compose -f $(COMPOSE_FILE) images
ls : # List running compose projects
	docker compose -f $(COMPOSE_FILE) ls
ps : # List containers
	docker ps -a
	docker compose -f $(COMPOSE_FILE) ps -a
logs l : # View output from containers
	docker compose -f $(COMPOSE_FILE) logs -f
top : # Display the running processes
	docker compose -f $(COMPOSE_FILE) top


down : # Stop and remove containers, networks
	-docker compose -f $(COMPOSE_FILE) down --remove-orphans
s stop : # Stop services
	-docker compose -f $(COMPOSE_FILE) stop
rm remove : # Removes stopped service containers
	-docker compose -f $(COMPOSE_FILE) rm -f
rmi : # Removes images
	-docker rmi $$(docker images | awk 'NR>1 {print $3}' | tr '\n' ' ')
rmv : # clean volumes
	- yes | docker volume prune
	# -docker volume rm $$(docker volume ls | awk 'NR>1 {print $2}' | tr '\n' ' ')
	-rm -rf ./srcs/requirements/web/webapps/*
	# -rm -rf /home/jm/data/website/*
kill k : # Force stop service containers.
	-docker compose -f $(COMPOSE_FILE) kill --remove-orphans


clean c : down rm rmi rmv
fclean fc : clean
	rm -rf ./srcs/requirements/web/webapps
	-yes | docker system prune
reset : clean all
freset : fclean all

restart res : # Restart service containers
	-docker compose -f $(COMPOSE_FILE) restart

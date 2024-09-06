# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    Makefile                                           :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: jm <jm@student.42lyon.fr>                  +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2024/06/17 20:14:21 by jm                #+#    #+#              #
#    Updated: 2024/07/18 20:06:40 by jm               ###   ########lyon.fr    #
#                                                                              #
# **************************************************************************** #

.PHONY: all

ENV := ./srcs/.env
COMPOSE_FILE := ./srcs/docker-compose.yml 

include $(ENV)

compose_v2_not_supported = $(shell command docker compose 2> /dev/null)
ifeq (,$(compose_v2_not_supported))
  DOCKER_COMPOSE_COMMAND = docker-compose
else
  DOCKER_COMPOSE_COMMAND = docker compose
endif

#vm.max_map_count
REQUIRED_VM_MAX_MAP_COUNT= vm.max_map_count = 262144
vm_max_map_count = $(shell command sudo sysctl vm.max_map_count 2> /dev/null)


all : build up

# ifneq '$(REQUIRED_VM_MAX_MAP_COUNT)' "$(strip $(vm_max_map_count))"
# 	$(info updating vm.max_map_count...)
# 	@sudo sysctl -w vm.max_map_count=262144 | grep -q ''
# 	$(info vm.max_map_count updated)
# else
# 	$(info vm.max_map_count is well defined!)
# endif


build b : # Build or rebuild services
	-sudo $(DOCKER_COMPOSE_COMMAND) -f $(COMPOSE_FILE) build
create cr : # Creates containers for a service
	-sudo $(DOCKER_COMPOSE_COMMAND) -f $(COMPOSE_FILE) create --remove-orphans
start : # Start services
	-sudo $(DOCKER_COMPOSE_COMMAND) -f $(COMPOSE_FILE) start
up : # Create and start containers
	-sudo $(DOCKER_COMPOSE_COMMAND) -f $(COMPOSE_FILE) up -d
exec : # Execute a command in a running container.
	-sudo $(DOCKER_COMPOSE_COMMAND) -f $(COMPOSE_FILE) exec


images im : # List images used by the created containers
	-sudo docker images
	-sudo $(DOCKER_COMPOSE_COMMAND) -f $(COMPOSE_FILE) images
ls : # List running compose projects
	sudo $(DOCKER_COMPOSE_COMMAND) -f $(COMPOSE_FILE) ls
ps : # List containers
	sudo docker ps -a
	sudo $(DOCKER_COMPOSE_COMMAND) -f $(COMPOSE_FILE) ps -a
logs l : # View output from containers
	sudo $(DOCKER_COMPOSE_COMMAND) -f $(COMPOSE_FILE) logs -f
top : # Display the running processes
	sudo $(DOCKER_COMPOSE_COMMAND) -f $(COMPOSE_FILE) top


down : # Stop and remove containers, networks
	-sudo $(DOCKER_COMPOSE_COMMAND) -f $(COMPOSE_FILE) down #--remove-orphans
s stop : # Stop services
	-sudo $(DOCKER_COMPOSE_COMMAND) -f $(COMPOSE_FILE) stop
rm remove : # Removes stopped service containers
	-sudo $(DOCKER_COMPOSE_COMMAND) -f $(COMPOSE_FILE) rm -f
rmi : # Removes images
	-sudo docker rmi $$(sudo docker images | awk 'NR>1 {print $3}' | tr '\n' ' ')
rmv : # clean volumes
	- yes | sudo docker volume prune
	# -sudo docker volume rm $$(sudo docker volume ls | awk 'NR>1 {print $2}' | tr '\n' ' ')
	-sudo rm -rf ./srcs/requirements/web/webapps/*
	# -sudo rm -rf /home/jm/data/website/*
kill k : # Force stop service containers.
	-sudo $(DOCKER_COMPOSE_COMMAND) -f $(COMPOSE_FILE) kill --remove-orphans


clean c : down rm rmi rmv
fclean fc : clean
	-yes | sudo docker system prune
reset : clean all
freset : fclean all

restart res : # Restart service containers
	-sudo $(DOCKER_COMPOSE_COMMAND) -f $(COMPOSE_FILE) restart



### Use below command as last resort when encountering some complications with docker containers
# sudo systemctl restart docker.socket docker.service

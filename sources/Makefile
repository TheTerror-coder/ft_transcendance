ENV :=./srcs/.env
COMPOSE_FILE= ./srcs/docker-compose.yml
export HOST_IP=$(shell hostname -I | awk '{print $$1}')

include $(ENV)

all : build up

build b : # Build or rebuild services
	-HOST_IP=$(HOST_IP) docker compose -f $(COMPOSE_FILE) build
create cr : # Creates containers for a service
	-HOST_IP=$(HOST_IP) docker compose -f $(COMPOSE_FILE) create --remove-orphans
start : # Start services
	-HOST_IP=$(HOST_IP) docker compose -f $(COMPOSE_FILE) start
up : # Create and start containers
	-HOST_IP=$(HOST_IP) docker compose -f $(COMPOSE_FILE) up -d
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
	-docker rmi $$(docker images | awk 'NR>1 {print $$3}' | tr '\n' ' ')
rmv : # clean data
	-docker volume prune -f
#	-rm -rf ./srcs/requirements/backend/backendapps/*
#TODO: enable below line and disable the above one on personal space monitorable by sudo
#	-sudo rm -rf ./srcs/requirements/backend/backendapps/*
kill k : # Force stop service containers.
	-docker compose -f $(COMPOSE_FILE) kill --remove-orphans

backend : # Rebuild and restart only the backend container
	-docker compose -f $(COMPOSE_FILE) down backend
	-docker volume rm $$(docker volume ls --filter name=backendapps --format "{{.Name}}")
	-docker compose -f $(COMPOSE_FILE) up -d --build backend

###JM Customs###
cleanv cv : # clean all volumes
	-docker volume prune -f
	-docker volume rm $$(docker volume ls | awk 'NR>1 {print $$2}' | tr '\n' ' ') 2> /dev/null
clean c : down rm rmi rmv
fclean fc : clean cleanv
	-docker system prune -f
reset : clean cleanv all
freset re : fclean all

valerie: cleanv all

restart res : # Restart service containers
	-docker compose -f $(COMPOSE_FILE) restart

###JM Customs###
jmcleanv jmcv : # clean all volumes
	-docker volume prune -f
	-docker volume rm $$(docker volume ls | awk 'NR>1 {print $$2}' | tr '\n' ' ') 2> /dev/null
jmclean jmc : down rm rmi rmv
jmfclean jmfc : jmclean jmcleanv
	-docker system prune -f
jmreset : jmclean all
jmfreset : jmfclean all

jmrestart jmres : # Restart service containers
	-docker compose -f $(COMPOSE_FILE) restart
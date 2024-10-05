
ENV :=./srcs/.env
COMPOSE_FILE= ./srcs/docker-compose.yml 

include $(ENV)

all : build up

build b : # Build or rebuild services
	-mkdir -p $(PATHTO_WEBAPPS_DATA)
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
	-docker rmi $$(docker images | awk 'NR>1 {print $$3}' | tr '\n' ' ')
rmv : # clean data
	-docker volume prune -f
	-sudo rm -rf ./srcs/requirements/web/webapps/*
kill k : # Force stop service containers.
	-docker compose -f $(COMPOSE_FILE) kill --remove-orphans


cleanv cv : # clean all volumes
	-docker volume prune -f
	-docker volume rm $$(docker volume ls | awk 'NR>1 {print $$2}' | tr '\n' ' ') 2> /dev/null
clean c : down rm rmi rmv
fclean fc : clean cleanv
	-docker system prune -f
reset : clean all
freset : fclean all

restart res : # Restart service containers
	-docker compose -f $(COMPOSE_FILE) restart

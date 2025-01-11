###FILES
ENV						= ./srcs/.env
HOST_IP_SCRIPT			= ./srcs/tools/host-ip.sh
COMPOSE_FILE			= ./srcs/docker-compose.yml
ELK_COMPOSE_FILE		= ./srcs/elk-docker-compose.yml

include $(ENV)
export ULTIMAPI_REDIRECT_URI_PART1
export ULTIMAPI_REDIRECT_URI_PART2

export HOST_IP					:=$(shell $(HOST_IP_SCRIPT) $(ENV))
export ULTIMAPI_REDIRECT_URI	:=$(shell echo $(ULTIMAPI_REDIRECT_URI_PART1)$(HOST_IP)$(ULTIMAPI_REDIRECT_URI_PART2))

all : build up

onepong : build-onepong up-onepong

# host_ip :
# 	-@sh -c '$(HOST_IP_SCRIPT) $(ENV)'

build b : # Build or rebuild services
	-docker compose -f $(COMPOSE_FILE) build

build-onepong : # Build or rebuild services
	-docker compose -f $(COMPOSE_FILE) -f $(ELK_COMPOSE_FILE) build

create cr : # Creates containers for a service
	-docker compose -f $(COMPOSE_FILE) create --remove-orphans

create-onepong : # Creates containers for a service
	-docker compose -f $(COMPOSE_FILE) -f $(ELK_COMPOSE_FILE) create --remove-orphans

start : # Start services
	-docker compose -f $(COMPOSE_FILE) start

start-onepong : # Start services
	-docker compose -f $(COMPOSE_FILE) -f $(ELK_COMPOSE_FILE) start

up : # Create and start containers
	-docker compose -f $(COMPOSE_FILE) up -d
	@-echo HOST IP : $(HOST_IP)

up-onepong : # Create and start containers
	-docker compose -f $(COMPOSE_FILE) -f $(ELK_COMPOSE_FILE) up -d
	@-echo HOST IP : $(HOST_IP)

exec : # Execute a command in a running container.
	-docker compose -f $(COMPOSE_FILE) exec


images im : # List images used by the created containers
	-docker images
	-docker compose -f $(COMPOSE_FILE) -f $(ELK_COMPOSE_FILE) images
ls : # List running compose projects
	docker compose -f $(COMPOSE_FILE) -f $(ELK_COMPOSE_FILE) ls
ps : # List containers
	docker ps -a
	docker compose -f $(COMPOSE_FILE) -f $(ELK_COMPOSE_FILE) ps -a
logs l : # View output from containers
	docker compose -f $(COMPOSE_FILE) -f $(ELK_COMPOSE_FILE) logs -f
top : # Display the running processes
	docker compose -f $(COMPOSE_FILE) -f $(ELK_COMPOSE_FILE) top


down : # Stop and remove containers, networks
	-docker compose -f $(COMPOSE_FILE) -f $(ELK_COMPOSE_FILE) down --remove-orphans
s stop : # Stop services
	-docker compose -f $(COMPOSE_FILE) -f $(ELK_COMPOSE_FILE) stop
rm remove : # Removes stopped service containers
	-docker compose -f $(COMPOSE_FILE) -f $(ELK_COMPOSE_FILE) rm -f
rmi : # Removes images
	-docker rmi $$(docker images | awk 'NR>1 {print $$3}' | tr '\n' ' ')
rmv : # clean data
	-docker volume prune -f
kill k : # Force stop service containers.
	-docker compose -f $(COMPOSE_FILE) -f $(ELK_COMPOSE_FILE) kill --remove-orphans

backend : # Rebuild and restart only the backend container
	-docker compose -f $(COMPOSE_FILE) down backend
	-docker volume rm $$(docker volume ls --filter name=backendapps --format "{{.Name}}")
	-docker compose -f $(COMPOSE_FILE) up -d --build backend

clean c : down rm rmi rmv
cleanv cv : # clean all volumes
	-docker volume prune -f
	-docker volume rm $$(docker volume ls | awk 'NR>1 {print $$2}' | tr '\n' ' ') 2> /dev/null
fclean fc : clean cleanv
	-docker system prune -f
re : clean all
reset : clean cleanv all
freset : fclean all

valerie: cleanv all

restart res : # Restart service containers
	-docker compose -f $(COMPOSE_FILE) -f $(ELK_COMPOSE_FILE) restart

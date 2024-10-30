
ENV := ../../../.env

include $(ENV)

PORTS = #-p 8080:443

all : build run

build :
	docker build ../ -t  $(VAULT_IMAGE)
run :
	docker run $(ENV) -it --rm --name $(VAULT_CONTAINER) $(PORTS) $(VAULT_IMAGE) 
exec :
	docker exec -it  $(VAULT_CONTAINER) sh
clean :
	docker image rm $(VAULT_IMAGE)
fclean : stop
	docker image rm $(VAULT_IMAGE)
stop :
	docker stop  $(VAULT_CONTAINER)
ps :
	docker ps -a
ls :
	docker image ls
	docker container ls
logs :
	docker logs  $(VAULT_CONTAINER)

re : fclean all
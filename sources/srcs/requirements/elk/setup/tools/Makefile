
ENV := ../../../../.env

include $(ENV)

PORTS = #-p 8080:443

all : build run

build :
	docker build ../ -t  $(SETUP_IMAGE)
run :
	docker run $(ENV) -it --rm --name $(SETUP_CONTAINER) $(PORTS) $(SETUP_IMAGE) 
exec :
	docker exec -it  $(SETUP_CONTAINER) bash
clean :
	docker image rm $(SETUP_IMAGE)
fclean : stop
	docker image rm $(SETUP_IMAGE)
stop :
	docker stop  $(SETUP_CONTAINER)
ps :
	docker ps -a
ls :
	docker image ls
	docker container ls
logs :
	docker logs $(SETUP_CONTAINER)
logsf : # follow log output
	docker logs --follow $(SETUP_CONTAINER)

restart :
	docker restart $(SETUP_CONTAINER)

re : fclean all

ENV := ../../../../.env

include $(ENV)

PORTS = #-p 8080:443

all : build run

build :
	docker build ../ -t  $(ES_IMAGE)
run :
	docker run $(ENV) -it --rm --name $(ES_CONTAINER) $(PORTS) $(ES_IMAGE) 
exec :
	docker exec -it  $(ES_CONTAINER) bash
clean :
	docker image rm $(ES_IMAGE)
fclean : stop
	docker image rm $(ES_IMAGE)
stop :
	docker stop  $(ES_CONTAINER)
ps :
	docker ps -a
ls :
	docker image ls
	docker container ls
logs :
	docker logs $(ES_CONTAINER)
logsf : # follow log output
	docker logs --follow $(ES_CONTAINER)

restart :
	docker restart $(ES_CONTAINER)

re : fclean all
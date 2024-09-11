
ENV := ../../../../.env

include $(ENV)

PORTS = #-p 8080:443

all : build run

build :
	sudo docker build ../ -t  $(ES_IMAGE)
run :
	sudo docker run $(ENV) -it --rm --name $(ES_CONTAINER) $(PORTS) $(ES_IMAGE) 
exec :
	sudo docker exec -it  $(ES_CONTAINER) bash
clean :
	sudo docker image rm $(ES_IMAGE)
fclean : stop
	sudo docker image rm $(ES_IMAGE)
stop :
	sudo docker stop  $(ES_CONTAINER)
ps :
	sudo docker ps -a
ls :
	sudo docker image ls
	sudo docker container ls
logs :
	sudo docker logs $(ES_CONTAINER)
logsf : # follow log output
	sudo docker logs --follow $(ES_CONTAINER)

restart :
	sudo docker restart $(ES_CONTAINER)

re : fclean all
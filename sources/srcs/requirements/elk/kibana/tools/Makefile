
ENV := ../../../../.env

include $(ENV)

PORTS = #-p 8080:443

all : build run

build :
	sudo docker build ../ -t  $(KIBANA_IMAGE)
run :
	sudo docker run $(ENV) -it --rm --name $(KIBANA_CONTAINER) $(PORTS) $(KIBANA_IMAGE) 
exec :
	sudo docker exec -it  $(KIBANA_CONTAINER) bash
clean :
	sudo docker image rm $(KIBANA_IMAGE)
fclean : stop
	sudo docker image rm $(KIBANA_IMAGE)
stop :
	sudo docker stop  $(KIBANA_CONTAINER)
ps :
	sudo docker ps -a
ls :
	sudo docker image ls
	sudo docker container ls
logs :
	sudo docker logs $(KIBANA_CONTAINER)
logsf : # follow log output
	sudo docker logs --follow $(KIBANA_CONTAINER)

restart :
	sudo docker restart $(KIBANA_CONTAINER)

re : fclean all
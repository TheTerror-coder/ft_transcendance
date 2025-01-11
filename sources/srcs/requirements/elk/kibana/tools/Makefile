
ENV := ../../../../.env

include $(ENV)

PORTS = #-p 8080:443

all : build run

build :
	docker build ../ -t  $(KIBANA_IMAGE)
run :
	docker run $(ENV) -it --rm --name $(KIBANA_CONTAINER) $(PORTS) $(KIBANA_IMAGE) 
exec :
	docker exec -it  $(KIBANA_CONTAINER) bash
clean :
	docker image rm $(KIBANA_IMAGE)
fclean : stop
	docker image rm $(KIBANA_IMAGE)
stop :
	docker stop  $(KIBANA_CONTAINER)
ps :
	docker ps -a
ls :
	docker image ls
	docker container ls
logs :
	docker logs $(KIBANA_CONTAINER)
logsf : # follow log output
	docker logs --follow $(KIBANA_CONTAINER)

restart :
	docker restart $(KIBANA_CONTAINER)

re : fclean all
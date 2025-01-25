
ENV :=../../../.env

include $(ENV)

PORTS = #-p 8080:443

all : build run

build :
	docker build ../ -t  $(FRONTEND_IMAGE)
run :
	docker run $(ENV) -it --rm --name $(FRONTEND_CONTAINER) $(PORTS) $(FRONTEND_IMAGE) 
exec :
	docker exec -it  $(FRONTEND_CONTAINER) sh
clean :
	docker image rm $(FRONTEND_IMAGE)
fclean : stop
	docker image rm $(FRONTEND_IMAGE)
stop :
	docker stop  $(FRONTEND_CONTAINER)
ps :
	docker ps -a
ls :
	docker image ls
	docker container ls
logs :
	docker logs $(FRONTEND_CONTAINER)
logsf : # follow log output
	docker logs --follow $(FRONTEND_CONTAINER)

restart :
	docker restart $(FRONTEND_CONTAINER)

re : fclean all
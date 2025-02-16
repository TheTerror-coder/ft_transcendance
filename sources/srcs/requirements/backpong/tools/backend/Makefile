
ENV :=../../../../.env

include $(ENV)

PORTS = #-p 8080:443

all : build run

build :
	docker build ../ -t  $(BACKEND_IMAGE)
run :
	docker run $(ENV) -it --rm --name $(BACKEND_CONTAINER) $(PORTS) $(BACKEND_IMAGE) 
exec :
	docker exec -it  $(BACKEND_CONTAINER) sh
restart :
	docker restart  $(BACKEND_CONTAINER)
clean :
	docker image rm $(BACKEND_IMAGE)
fclean : stop
	docker image rm $(BACKEND_IMAGE)
stop :
	docker stop  $(BACKEND_CONTAINER)
ps :
	docker ps -a
ls :
	docker image ls
	docker container ls
logs :
	docker logs $(BACKEND_CONTAINER)
logsf :
	docker logs -f $(BACKEND_CONTAINER)

re : fclean all
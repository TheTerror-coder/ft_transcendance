
ENV :=../../../../.env

include $(ENV)

PORTS = #-p 8080:443

all : build run

build :
	docker build ../ -t  $(GAMESERVER_IMAGE)
run :
	docker run $(ENV) -it --rm --name $(GAMESERVER_CONTAINER) $(PORTS) $(GAMESERVER_IMAGE) 
exec :
	docker exec -it  $(GAMESERVER_CONTAINER) sh
clean :
	docker image rm $(GAMESERVER_IMAGE)
fclean : stop
	docker image rm $(GAMESERVER_IMAGE)
stop :
	docker stop  $(GAMESERVER_CONTAINER)
ps :
	docker ps -a
ls :
	docker image ls
	docker container ls
logs :
	docker logs $(GAMESERVER_CONTAINER)

re : fclean all
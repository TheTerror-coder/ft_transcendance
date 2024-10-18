
ENV :=../../../.env

include $(ENV)

PORTS = #-p 8080:443

all : build run

build :
	docker build ../ -t  $(NODE_IMAGE)
run :
	docker run $(ENV) -it --rm --name $(NODE_CONTAINER) $(PORTS) $(NODE_IMAGE) 
exec :
	docker exec -it  $(NODE_CONTAINER) sh
clean :
	docker image rm $(NODE_IMAGE)
fclean : stop
	docker image rm $(NODE_IMAGE)
stop :
	docker stop  $(NODE_CONTAINER)
ps :
	docker ps -a
ls :
	docker image ls
	docker container ls
logs :
	docker logs $(NODE_CONTAINER)

re : fclean all
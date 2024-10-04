
ENV :=../../../.env

include $(ENV)

PORTS = #-p 8080:443

all : build run

build :
	docker build ../ -t  $(WEB_IMAGE)
run :
	docker run $(ENV) -it --rm --name $(WEB_CONTAINER) $(PORTS) $(WEB_IMAGE) 
exec :
	docker exec -it  $(WEB_CONTAINER) sh
clean :
	docker image rm $(WEB_IMAGE)
fclean : stop
	docker image rm $(WEB_IMAGE)
stop :
	docker stop  $(WEB_CONTAINER)
ps :
	docker ps -a
ls :
	docker image ls
	docker container ls
logs :
	docker logs $(WEB_CONTAINER)

re : fclean all
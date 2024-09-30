
ENV :=../../../.env

include $(ENV)

PORTS = #-p 8080:443

all : build run

build :
	sudo docker build ../ -t  $(WEB_IMAGE)
run :
	sudo docker run $(ENV) -it --rm --name $(WEB_CONTAINER) $(PORTS) $(WEB_IMAGE) 
exec :
	sudo docker exec -it  $(WEB_CONTAINER) sh
clean :
	sudo docker image rm $(WEB_IMAGE)
fclean : stop
	sudo docker image rm $(WEB_IMAGE)
stop :
	sudo docker stop  $(WEB_CONTAINER)
ps :
	sudo docker ps -a
ls :
	sudo docker image ls
	sudo docker container ls
logs :
	sudo docker logs $(WEB_CONTAINER)

re : fclean all
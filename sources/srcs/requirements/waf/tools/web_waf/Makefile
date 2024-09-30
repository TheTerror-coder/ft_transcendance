
ENV :=../../../../.env

include $(ENV)

PORTS = #-p 8080:443

all : build run

build :
	sudo docker build ../ -t  $(WEBWAF_IMAGE)
run :
	sudo docker run $(ENV) -it --rm --name $(WEBWAF_CONTAINER) $(PORTS) $(WEBWAF_IMAGE) 
exec :
	sudo docker exec -it  $(WEBWAF_CONTAINER) sh
clean :
	sudo docker image rm $(WEBWAF_IMAGE)
fclean : stop
	sudo docker image rm $(WEBWAF_IMAGE)
stop :
	sudo docker stop  $(WEBWAF_CONTAINER)
ps :
	sudo docker ps -a
ls :
	sudo docker image ls
	sudo docker container ls
logs :
	sudo docker logs $(WEBWAF_CONTAINER)
logsf : # follow log output
	sudo docker logs --follow $(WEBWAF_CONTAINER)

restart :
	sudo docker restart $(WEBWAF_CONTAINER)

re : fclean all
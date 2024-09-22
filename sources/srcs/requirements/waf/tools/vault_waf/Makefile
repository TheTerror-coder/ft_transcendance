
ENV :=../../../../.env

include $(ENV)

PORTS = #-p 8080:443

all : build run

build :
	sudo docker build ../ -t  $(VAULTWAF_IMAGE)
run :
	sudo docker run $(ENV) -it --rm --name $(VAULTWAF_CONTAINER) $(PORTS) $(VAULTWAF_IMAGE) 
exec :
	sudo docker exec -it  $(VAULTWAF_CONTAINER) sh
clean :
	sudo docker image rm $(VAULTWAF_IMAGE)
fclean : stop
	sudo docker image rm $(VAULTWAF_IMAGE)
stop :
	sudo docker stop  $(VAULTWAF_CONTAINER)
ps :
	sudo docker ps -a
ls :
	sudo docker image ls
	sudo docker container ls
logs :
	sudo docker logs $(VAULTWAF_CONTAINER)
logsf : # follow log output
	sudo docker logs --follow $(VAULTWAF_CONTAINER)

restart :
	sudo docker restart $(VAULTWAF_CONTAINER)

re : fclean all

ENV :=../../../.env

include $(ENV)

PORTS = #-p 8080:443

all : build run

build :
	sudo docker build ../ -t  $(MODSEC_IMAGE)
run :
	sudo docker run $(ENV) -it --rm --name $(MODSEC_CONTAINER) $(PORTS) $(MODSEC_IMAGE) 
exec :
	sudo docker exec -it  $(MODSEC_CONTAINER) sh
clean :
	sudo docker image rm $(MODSEC_IMAGE)
fclean : stop
	sudo docker image rm $(MODSEC_IMAGE)
stop :
	sudo docker stop  $(MODSEC_CONTAINER)
ps :
	sudo docker ps -a
ls :
	sudo docker image ls
	sudo docker container ls
logs :
	sudo docker logs $(MODSEC_CONTAINER)
logsf : # follow log output
	sudo docker logs --follow $(MODSEC_CONTAINER)

restart :
	sudo docker restart $(MODSEC_CONTAINER)

re : fclean all
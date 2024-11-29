
ENV :=../../../../.env

include $(ENV)

PORTS = #-p 8080:443

all : build run

build :
	docker build ../ -t  $(VAULTWAF_IMAGE)
run :
	docker run $(ENV) -it --rm --name $(VAULTWAF_CONTAINER) $(PORTS) $(VAULTWAF_IMAGE) 
exec :
	docker exec -it  $(VAULTWAF_CONTAINER) sh
clean :
	docker image rm $(VAULTWAF_IMAGE)
fclean : stop
	docker image rm $(VAULTWAF_IMAGE)
stop :
	docker stop  $(VAULTWAF_CONTAINER)
ps :
	docker ps -a
ls :
	docker image ls
	docker container ls
logs :
	docker logs $(VAULTWAF_CONTAINER)
logsf : # follow log output
	docker logs --follow $(VAULTWAF_CONTAINER)

restart :
	docker restart $(VAULTWAF_CONTAINER)

re : fclean all
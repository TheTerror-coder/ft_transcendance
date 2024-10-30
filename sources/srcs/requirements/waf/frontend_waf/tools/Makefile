
ENV :=../../../../.env

include $(ENV)

PORTS = #-p 8080:443

all : build run

build :
	docker build ../ -t  $(FRONTENDWAF_IMAGE)
run :
	docker run $(ENV) -it --rm --name $(FRONTENDWAF_CONTAINER) $(PORTS) $(FRONTENDWAF_IMAGE) 
exec :
	docker exec -it  $(FRONTENDWAF_CONTAINER) sh
clean :
	docker image rm $(FRONTENDWAF_IMAGE)
fclean : stop
	docker image rm $(FRONTENDWAF_IMAGE)
stop :
	docker stop  $(FRONTENDWAF_CONTAINER)
ps :
	docker ps -a
ls :
	docker image ls
	docker container ls
logs :
	docker logs $(FRONTENDWAF_CONTAINER)
logsf : # follow log output
	docker logs --follow $(FRONTENDWAF_CONTAINER)

restart :
	docker restart $(FRONTENDWAF_CONTAINER)

re : fclean all

ENV :=../../../../.env

include $(ENV)

PORTS = #-p 8080:443

all : build run

build :
	docker build ../ -t  $(WEBWAF_IMAGE)
run :
	docker run $(ENV) -it --rm --name $(WEBWAF_CONTAINER) $(PORTS) $(WEBWAF_IMAGE) 
exec :
	docker exec -it  $(WEBWAF_CONTAINER) sh
clean :
	docker image rm $(WEBWAF_IMAGE)
fclean : stop
	docker image rm $(WEBWAF_IMAGE)
stop :
	docker stop  $(WEBWAF_CONTAINER)
ps :
	docker ps -a
ls :
	docker image ls
	docker container ls
logs :
	docker logs $(WEBWAF_CONTAINER)
logsf : # follow log output
	docker logs --follow $(WEBWAF_CONTAINER)

restart :
	docker restart $(WEBWAF_CONTAINER)

re : fclean all
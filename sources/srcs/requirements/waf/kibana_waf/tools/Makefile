
ENV :=../../../../.env

include $(ENV)

PORTS = #-p 8080:443

all : build run

build :
	docker build ../ -t  $(KIBANAWAF_IMAGE)
run :
	docker run $(ENV) -it --rm --name $(KIBANAWAF_CONTAINER) $(PORTS) $(KIBANAWAF_IMAGE) 
exec :
	docker exec -it  $(KIBANAWAF_CONTAINER) sh
clean :
	docker image rm $(KIBANAWAF_IMAGE)
fclean : stop
	docker image rm $(KIBANAWAF_IMAGE)
stop :
	docker stop  $(KIBANAWAF_CONTAINER)
ps :
	docker ps -a
ls :
	docker image ls
	docker container ls
logs :
	docker logs $(KIBANAWAF_CONTAINER)
logsf : # follow log output
	docker logs --follow $(KIBANAWAF_CONTAINER)

restart :
	docker restart $(KIBANAWAF_CONTAINER)

re : fclean all
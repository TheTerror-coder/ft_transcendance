
ENV :=../../../../.env

include $(ENV)

PORTS = #-p 8080:443

all : build run

build :
	docker build ../ -t  $(NODEWAF_IMAGE)
run :
	docker run $(ENV) -it --rm --name $(NODEWAF_CONTAINER) $(PORTS) $(NODEWAF_IMAGE) 
exec :
	docker exec -it  $(NODEWAF_CONTAINER) sh
clean :
	docker image rm $(NODEWAF_IMAGE)
fclean : stop
	docker image rm $(NODEWAF_IMAGE)
stop :
	docker stop  $(NODEWAF_CONTAINER)
ps :
	docker ps -a
ls :
	docker image ls
	docker container ls
logs :
	docker logs $(NODEWAF_CONTAINER)
logsf : # follow log output
	docker logs --follow $(NODEWAF_CONTAINER)

restart :
	docker restart $(NODEWAF_CONTAINER)

re : fclean all

ENV :=../../../../.env

include $(ENV)

PORTS = #-p 8080:443

all : build run

build :
	docker build ../ -t  $(PROXYWAF_IMAGE)
run :
	docker run $(ENV) -it --rm --name $(PROXYWAF_CONTAINER) $(PORTS) $(PROXYWAF_IMAGE) 
exec :
	docker exec -it  $(PROXYWAF_CONTAINER) sh
clean :
	docker image rm $(PROXYWAF_IMAGE)
fclean : stop
	docker image rm $(PROXYWAF_IMAGE)
stop :
	docker stop  $(PROXYWAF_CONTAINER)
ps :
	docker ps -a
ls :
	docker image ls
	docker container ls
logs :
	docker logs $(PROXYWAF_CONTAINER)
logsf : # follow log output
	docker logs --follow $(PROXYWAF_CONTAINER)

restart :
	docker restart $(PROXYWAF_CONTAINER)

re : fclean all
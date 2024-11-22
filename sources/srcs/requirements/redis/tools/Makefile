
ENV :=../../../.env

include $(ENV)

PORTS = #-p 8080:443

all : build run

build :
	docker build ../ -t  $(REDIS_IMAGE)
run :
	docker run $(ENV) -it --rm --name $(REDIS_CONTAINER) $(PORTS) $(REDIS_IMAGE) 
exec :
	docker exec -it  $(REDIS_CONTAINER) sh
clean :
	docker image rm $(REDIS_IMAGE)
fclean : stop
	docker image rm $(REDIS_IMAGE)
stop :
	docker stop  $(REDIS_CONTAINER)
ps :
	docker ps -a
ls :
	docker image ls
	docker container ls
logs :
	docker logs $(REDIS_CONTAINER)
logsf : # follow log output
	docker logs --follow $(REDIS_CONTAINER)

re : fclean all
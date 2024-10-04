
ENV :=../../../.env

include $(ENV)

PORTS = #-p 8080:443

all : build run

build :
	docker build ../ -t  $(POSTGRES_IMAGE)
run :
	docker run $(ENV) -it --rm --name $(POSTGRES_CONTAINER) $(PORTS) $(POSTGRES_IMAGE) 
exec :
	docker exec -it  $(POSTGRES_CONTAINER) sh
clean :
	docker image rm $(POSTGRES_IMAGE)
fclean : stop
	docker image rm $(POSTGRES_IMAGE)
stop :
	docker stop  $(POSTGRES_CONTAINER)
ps :
	docker ps -a
ls :
	docker image ls
	docker container ls
logs :
	docker logs $(POSTGRES_CONTAINER)

re : fclean all
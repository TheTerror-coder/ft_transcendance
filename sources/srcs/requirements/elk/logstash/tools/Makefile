
ENV := ../../../../.env

include $(ENV)

PORTS = #-p 8080:443

all : build run

build :
	docker build ../ -t  $(LOGSTASH_IMAGE)
run :
	docker run $(ENV) -it --rm --name $(LOGSTASH_CONTAINER) $(PORTS) $(LOGSTASH_IMAGE) 
exec :
	docker exec -it  $(LOGSTASH_CONTAINER) bash
clean :
	docker image rm $(LOGSTASH_IMAGE)
fclean : stop
	docker image rm $(LOGSTASH_IMAGE)
stop :
	docker stop  $(LOGSTASH_CONTAINER)
ps :
	docker ps -a
ls :
	docker image ls
	docker container ls
logs :
	docker logs $(LOGSTASH_CONTAINER)
logsf : # follow log output
	docker logs --follow $(LOGSTASH_CONTAINER)

restart :
	docker restart $(LOGSTASH_CONTAINER)

re : fclean all
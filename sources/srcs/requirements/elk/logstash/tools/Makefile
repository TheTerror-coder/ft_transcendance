# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    Makefile                                           :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: jm <jm@student.42lyon.fr>                  +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2024/06/17 20:18:50 by jm                #+#    #+#              #
#    Updated: 2024/07/18 20:17:11 by jm               ###   ########lyon.fr    #
#                                                                              #
# **************************************************************************** #

ENV := ../../../../.env

include $(ENV)

PORTS = #-p 8080:443

all : build run

build :
	sudo docker build ../ -t  $(LOGSTASH_IMAGE)
run :
	sudo docker run $(ENV) -it --rm --name $(LOGSTASH_CONTAINER) $(PORTS) $(LOGSTASH_IMAGE) 
exec :
	sudo docker exec -it  $(LOGSTASH_CONTAINER) bash
clean :
	sudo docker image rm $(LOGSTASH_IMAGE)
fclean : stop
	sudo docker image rm $(LOGSTASH_IMAGE)
stop :
	sudo docker stop  $(LOGSTASH_CONTAINER)
ps :
	sudo docker ps -a
ls :
	sudo docker image ls
	sudo docker container ls

re : fclean all
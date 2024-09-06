# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    Makefile                                           :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: jm <jm@student.42lyon.fr>                  +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2024/06/17 20:18:50 by jm                #+#    #+#              #
#    Updated: 2024/07/18 20:13:35 by jm               ###   ########lyon.fr    #
#                                                                              #
# **************************************************************************** #

ENV := ../../../../.env

include $(ENV)

PORTS = #-p 8080:443

all : build run

build :
	sudo docker build ../ -t  $(ES_IMAGE)
run :
	sudo docker run $(ENV) -it --rm --name $(ES_CONTAINER) $(PORTS) $(ES_IMAGE) 
exec :
	sudo docker exec -it  $(ES_CONTAINER) bash
clean :
	sudo docker image rm $(ES_IMAGE)
fclean : stop
	sudo docker image rm $(ES_IMAGE)
stop :
	sudo docker stop  $(ES_CONTAINER)
ps :
	sudo docker ps -a
ls :
	sudo docker image ls
	sudo docker container ls

re : fclean all
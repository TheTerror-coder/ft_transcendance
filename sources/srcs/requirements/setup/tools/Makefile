# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    Makefile                                           :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: jm <jm@student.42lyon.fr>                  +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2024/06/17 20:18:50 by jm                #+#    #+#              #
#    Updated: 2024/08/25 11:55:12 by jm               ###   ########lyon.fr    #
#                                                                              #
# **************************************************************************** #

ENV := ../../../.env

include $(ENV)

PORTS = #-p 8080:443

all : build run

build :
	sudo docker build ../ -t  $(SETUP_IMAGE)
run :
	sudo docker run $(ENV) -it --rm --name $(SETUP_CONTAINER) $(PORTS) $(SETUP_IMAGE) 
exec :
	sudo docker exec -it  $(SETUP_CONTAINER) sh
clean :
	sudo docker image rm $(SETUP_IMAGE)
fclean : stop
	sudo docker image rm $(SETUP_IMAGE)
stop :
	sudo docker stop  $(SETUP_CONTAINER)
ps :
	sudo docker ps -a
ls :
	sudo docker image ls
	sudo docker container ls
logs :
	sudo docker logs  $(SETUP_CONTAINER)

re : fclean all
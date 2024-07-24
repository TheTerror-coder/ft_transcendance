# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    Makefile                                           :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: jm <jm@student.42lyon.fr>                  +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2024/06/17 20:18:50 by jm                #+#    #+#              #
#    Updated: 2024/07/22 16:47:14 by jm               ###   ########lyon.fr    #
#                                                                              #
# **************************************************************************** #

ENV :=../../../.env

include $(ENV)

PORTS = #-p 8080:443

all : build run

build :
	sudo docker build ../ -t  $(NGINX_IMAGE)
run :
	sudo docker run $(ENV) -it --rm --name $(NGINX_CONTAINER) $(PORTS) $(NGINX_IMAGE) 
exec :
	sudo docker exec -it  $(NGINX_CONTAINER) sh
clean :
	sudo docker image rm $(NGINX_IMAGE)
fclean : stop
	sudo docker image rm $(NGINX_IMAGE)
stop :
	sudo docker stop  $(NGINX_CONTAINER)
ps :
	sudo docker ps -a
ls :
	sudo docker image ls
	sudo docker container ls
logs :
	sudo docker logs $(NGINX_CONTAINER)

restart :
	sudo docker restart $(NGINX_CONTAINER)

re : fclean all
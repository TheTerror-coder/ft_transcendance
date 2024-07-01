# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    Makefile                                           :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: jm <jm@student.42lyon.fr>                  +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2024/06/17 20:18:50 by jm                #+#    #+#              #
#    Updated: 2024/06/30 21:13:51 by jm               ###   ########lyon.fr    #
#                                                                              #
# **************************************************************************** #

IMAGE = web
CONTAINER = web_c
PORTS = #-p 8080:443
ENV = #--env-file ".env"

all : build run

build :
	sudo docker build ../ -t  $(IMAGE)
run :
	sudo docker run $(ENV) -it --rm --name $(CONTAINER) $(PORTS) $(IMAGE) 
exec :
	sudo docker exec -it  $(CONTAINER) sh
clean :
	sudo docker image rm $(IMAGE)
fclean : stop
	sudo docker image rm $(IMAGE)
stop :
	sudo docker stop  $(CONTAINER)
ps :
	sudo docker ps -a
ls :
	sudo docker image ls
	sudo docker container ls

re : fclean all
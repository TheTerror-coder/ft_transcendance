# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    Makefile                                           :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: jm <jm@student.42lyon.fr>                  +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2024/06/17 20:18:50 by jm                #+#    #+#              #
#    Updated: 2024/08/16 14:10:26 by jm               ###   ########lyon.fr    #
#                                                                              #
# **************************************************************************** #

ENV := ../../../.env

include $(ENV)

PORTS = #-p 8080:443

all : build run

build :
	sudo docker build ../ -t  $(VAULT_IMAGE)
run :
	sudo docker run $(ENV) -it --rm --name $(VAULT_CONTAINER) $(PORTS) $(VAULT_IMAGE) 
exec :
	sudo docker exec -it  $(VAULT_CONTAINER) sh
clean :
	sudo docker image rm $(VAULT_IMAGE)
fclean : stop
	sudo docker image rm $(VAULT_IMAGE)
stop :
	sudo docker stop  $(VAULT_CONTAINER)
ps :
	sudo docker ps -a
ls :
	sudo docker image ls
	sudo docker container ls
logs :
	sudo docker logs  $(VAULT_CONTAINER)

re : fclean all
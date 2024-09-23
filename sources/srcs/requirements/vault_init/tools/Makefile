# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    Makefile                                           :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: jm <jm@student.42lyon.fr>                  +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2024/06/17 20:18:50 by jm                #+#    #+#              #
#    Updated: 2024/08/20 20:53:03 by jm               ###   ########lyon.fr    #
#                                                                              #
# **************************************************************************** #

ENV := ../../../.env

include $(ENV)

PORTS = #-p 8080:443

all : build run

build :
	sudo docker build ../ -t  $(VAULT_INIT_IMAGE)
run :
	sudo docker run $(ENV) -it --rm --name $(VAULT_INIT_CONTAINER) $(PORTS) $(VAULT_INIT_IMAGE) 
exec :
	sudo docker exec -it  $(VAULT_INIT_CONTAINER) sh
clean :
	sudo docker image rm $(VAULT_INIT_IMAGE)
fclean : stop
	sudo docker image rm $(VAULT_INIT_IMAGE)
stop :
	sudo docker stop  $(VAULT_INIT_CONTAINER)
ps :
	sudo docker ps -a
ls :
	sudo docker image ls
	sudo docker container ls
logs :
	sudo docker logs  $(VAULT_INIT_CONTAINER)

re : fclean all
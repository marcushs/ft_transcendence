NAME = ft_transcendence
DOCKER_COMPOSE = docker compose -f ./src/docker-compose.yml
# VOLUME = /home/${USER}/data/
RM = sudo rm -rf
ENV = --env-file ./src/requirements/django/ft_transcendence/.env

all: up	

up: #${VOLUME}
	${DOCKER_COMPOSE} ${ENV} up --build --detach

down:
	${DOCKER_COMPOSE} down --volumes

clean: down
	
fclean: clean
	docker system prune -a -f --volumes

re: 
	${MAKE} fclean
	${MAKE}

# ${VOLUME}:
# 	mkdir -p ${VOLUME}postgres 

.PHONY: all up down clean fclean re

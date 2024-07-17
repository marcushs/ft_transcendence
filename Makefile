NAME = ft_transcendence
DOCKER_COMPOSE = docker compose -f ./src/docker-compose.yml
# VOLUME = /home/${USER}/data/
RM = sudo rm -rf
ENV = --env-file ./src/requirements/django/ft_transcendence/.env

all: up

up: #${VOLUME}
	${DOCKER_COMPOSE} ${ENV} up --build --detach --quiet-pull

down:
	${DOCKER_COMPOSE} down --volumes

clean: down

delete_medias:
# 	sudo rm -rf ./src/requirements/django/ft_transcendence/media

fclean: delete_medias clean
	docker system prune -a -f --volumes

re: 
	${MAKE} fclean
	${MAKE}

# ${VOLUME}:
# 	mkdir -p ${VOLUME}postgres 

.PHONY: all up down clean fclean re

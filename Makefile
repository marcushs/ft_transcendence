NAME = ft_transcendence
DOCKER_COMPOSE = docker compose -f ./src/docker-compose.yml
RM = sudo rm -rf
ENV = --env-file ./src/backend/.env

all: up

up:
	${DOCKER_COMPOSE} ${ENV} up --build --detach --quiet-pull

restart:
	${DOCKER_COMPOSE} ${ENV} down && ${DOCKER_COMPOSE} ${ENV} up --build --detach --quiet-pull

down:
	${DOCKER_COMPOSE} ${ENV} down --volumes

clean: down

fclean: clean
	docker system prune -a -f --volumes

re: 
	${MAKE} fclean
	${MAKE}

.PHONY: all up down clean fclean re

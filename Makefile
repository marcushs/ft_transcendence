NAME = ft_transcendence
DOCKER_COMPOSE = docker compose -f ./docker-compose.yml
RM = sudo rm -rf
ENV = --env-file ./src/backend/.env

all: up

up: build
	${DOCKER_COMPOSE} ${ENV} up --detach --quiet-pull

build:
	${DOCKER_COMPOSE} ${ENV} build --parallel

restart:
	${DOCKER_COMPOSE} ${ENV} down && ${DOCKER_COMPOSE} ${ENV} up --build --detach --quiet-pull

down:
	${DOCKER_COMPOSE} ${ENV} down --volumes

clean: down

fclean: clean
	docker system prune -a -f --volumes

re:
	@zsh -c 'find **/migrations -type f ! -name '__init__.py' | xargs rm -f'
	${MAKE} fclean
	${MAKE}

.PHONY: all up down clean fclean re

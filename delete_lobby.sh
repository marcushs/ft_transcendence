#! /bin/bash
# Load environment variables from .env file
export $(grep -v '^#' ./src/backend/.env | xargs)

#matchmaking
echo -e "_________MATCHMAKING CONTAINER_________\n"
docker exec -e PGPASSWORD=$MATCHMAKING_DB_PASSWORD matchmaking psql -U $MATCHMAKING_DB_USER -d $MATCHMAKING_DB_NAME -h $MATCHMAKING_DB_HOST -c "DELETE FROM matchmaking_app_privatematchlobby;"
#! /bin/bash
# Load environment variables from .env file
export $(grep -v "^#" ./src/backend/.env | xargs)

touch matchmaking_models.txt

#matchmaking_app_user
echo -e "_________matchmaking_APP_USER_________\n" >> matchmaking_models.txt
docker exec -e PGPASSWORD=$MATCHMAKING_DB_PASSWORD matchmaking psql -U $MATCHMAKING_DB_USER -d $MATCHMAKING_DB_NAME -h $MATCHMAKING_DB_HOST -c "SELECT * FROM matchmaking_app_user;" >> matchmaking_models.txt

echo -e "_________matchmaking_APP_LOBBY_________\n" >> matchmaking_models.txt
docker exec -e PGPASSWORD=$MATCHMAKING_DB_PASSWORD matchmaking psql -U $MATCHMAKING_DB_USER -d $MATCHMAKING_DB_NAME -h $MATCHMAKING_DB_HOST -c "SELECT * FROM matchmaking_app_privatematchlobby;" >> matchmaking_models.txt

echo "***************************************************************************************************************************" >> matchmaking_models.txt

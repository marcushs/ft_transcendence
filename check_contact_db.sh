#! /bin/bash
# Load environment variables from .env file
export $(grep -v '^#' ./src/backend/.env | xargs)

touch friends_models.txt

#friends_app_user
echo -e "_________FRIENDS_APP_USER_________\n" >> friends_models.txt
docker exec -e PGPASSWORD=$FRIENDS_DB_PASSWORD friends psql -U $FRIENDS_DB_USER -d $FRIENDS_DB_NAME -h $FRIENDS_DB_HOST -c "SELECT * FROM friends_app_user;" >> friends_models.txt

#friends_app_friendlist
echo -e "_________FRIENDS_APP_FRIENDLIST_________\n" >> friends_models.txt
docker exec -e PGPASSWORD=$FRIENDS_DB_PASSWORD friends psql -U $FRIENDS_DB_USER -d $FRIENDS_DB_NAME -h $FRIENDS_DB_HOST -c "SELECT * FROM friends_app_friendlist;" >> friends_models.txt

#friends_app_friendlist_friends
echo -e "_________FRIENDS_APP_FRIENDLIST_FRIENDS_________\n" >> friends_models.txt
docker exec -e PGPASSWORD=$FRIENDS_DB_PASSWORD friends psql -U $FRIENDS_DB_USER -d $FRIENDS_DB_NAME -h $FRIENDS_DB_HOST -c "SELECT * FROM friends_app_friendlist_friends;" >> friends_models.txt

echo "***************************************************************************************************************************" >> friends_models.txt

#! /bin/bash
# Load environment variables from .env file
export $(grep -v '^#' ./src/backend/.env | xargs)

touch result.txt

#auth
echo -e "________AUTH CONTAINER_________\n" >> result.txt
docker exec -e PGPASSWORD=$AUTH_DB_PASSWORD auth psql -U $AUTH_DB_USER -d $AUTH_DB_NAME -h $AUTH_DB_HOST -c "SELECT * FROM auth_app_user;" >> result.txt

#oauth_42
echo -e "________OAUTH_42 CONTAINER_________\n" >> result.txt
docker exec -e PGPASSWORD=$OAUTH_42_DB_PASSWORD oauth_42 psql -U $OAUTH_42_DB_USER -d $OAUTH_42_DB_NAME -h $OAUTH_42_DB_HOST -c "SELECT * FROM oauth_42_app_user;" >> result.txt

#oauth_google
echo -e "________OAUTH_GOOGLE CONTAINER_________\n" >> result.txt
docker exec -e PGPASSWORD=$OAUTH_GOOGLE_DB_PASSWORD oauth_google psql -U $OAUTH_GOOGLE_DB_USER -d $OAUTH_GOOGLE_DB_NAME -h $OAUTH_GOOGLE_DB_HOST -c "SELECT * FROM oauth_google_app_user;" >> result.txt

#oauth_github
echo -e "________OAUTH_GITHUB CONTAINER_________\n" >> result.txt
docker exec -e PGPASSWORD=$OAUTH_GITHUB_DB_PASSWORD oauth_github psql -U $OAUTH_GITHUB_DB_USER -d $OAUTH_GITHUB_DB_NAME -h $OAUTH_GITHUB_DB_HOST -c "SELECT * FROM oauth_github_app_user;" >> result.txt

#twofactor
echo -e "________TWO FACTOR CONTAINER_________\n" >> result.txt
docker exec -e PGPASSWORD=$TWOFACTOR_DB_PASSWORD twofactor psql -U $TWOFACTOR_DB_USER -d $TWOFACTOR_DB_NAME -h $TWOFACTOR_DB_HOST -c "SELECT * FROM twofactor_app_user;" >> result.txt

#user
echo -e "_________USER CONTAINER_________\n" >> result.txt
docker exec -e PGPASSWORD=$USER_DB_PASSWORD user psql -U $USER_DB_USER -d $USER_DB_NAME -h $USER_DB_HOST -c "SELECT * FROM user_app_user;" >> result.txt

#chat
echo -e "_________CHAT CONTAINER_________\n" >> result.txt
docker exec -e PGPASSWORD=$CHAT_DB_PASSWORD chat psql -U $CHAT_DB_USER -d $CHAT_DB_NAME -h $CHAT_DB_HOST -c "SELECT * FROM chat_app_user;" >> result.txt

#friends
echo -e "_________FRIENDS CONTAINER_________\n" >> result.txt
docker exec -e PGPASSWORD=$FRIENDS_DB_PASSWORD friends psql -U $FRIENDS_DB_USER -d $FRIENDS_DB_NAME -h $FRIENDS_DB_HOST -c "SELECT * FROM friends_app_user;" >> result.txt

#notifications
echo -e "_________NOTIFICATIONS CONTAINER_________\n" >> result.txt
docker exec -e PGPASSWORD=$NOTIFICATIONS_DB_PASSWORD notifications psql -U $NOTIFICATIONS_DB_USER -d $NOTIFICATIONS_DB_NAME -h $NOTIFICATIONS_DB_HOST -c "SELECT * FROM notifications_app_user;" >> result.txt

# #matchmaking
# echo -e "_________MATCHMAKING CONTAINER_________\n" >> result.txt
# docker exec -e PGPASSWORD=$MATCHMAKING_DB_PASSWORD matchmaking psql -U $MATCHMAKING_DB_USER -d $MATCHMAKING_DB_NAME -h $MATCHMAKING_DB_HOST -c "SELECT * FROM matchmaking_app_user;" >> result.txt

# #statistics
# echo -e "_________STATISTICS CONTAINER_________\n" >> result.txt
# docker exec -e PGPASSWORD=$STATISTICS_DB_PASSWORD statistics psql -U $STATISTICS_DB_USER -d $STATISTICS_DB_NAME -h $STATISTICS_DB_HOST -c "SELECT * FROM statistics_app_user;" >> result.txt

#! /bin/bash
# Load environment variables from .env file
export $(grep -v '^#' ./src/backend/.env | xargs)

#auth
echo -e "________AUTH CONTAINER_________\n" 
docker exec -e PGPASSWORD=$AUTH_DB_PASSWORD auth psql -U $AUTH_DB_USER -d $AUTH_DB_NAME -h $AUTH_DB_HOST -c "DELETE FROM auth_app_user;" 

#oauth_42
echo -e "________OAUTH_42 CONTAINER_________\n" 
docker exec -e PGPASSWORD=$OAUTH_42_DB_PASSWORD oauth_42 psql -U $OAUTH_42_DB_USER -d $OAUTH_42_DB_NAME -h $OAUTH_42_DB_HOST -c "DELETE FROM oauth_42_app_user;" 

#oauth_google
echo -e "________OAUTH_GOOGLE CONTAINER_________\n" 
docker exec -e PGPASSWORD=$OAUTH_GOOGLE_DB_PASSWORD oauth_google psql -U $OAUTH_GOOGLE_DB_USER -d $OAUTH_GOOGLE_DB_NAME -h $OAUTH_GOOGLE_DB_HOST -c "DELETE FROM oauth_google_app_user;" 

#oauth_github
echo -e "________OAUTH_GITHUB CONTAINER_________\n" 
docker exec -e PGPASSWORD=$OAUTH_GITHUB_DB_PASSWORD oauth_github psql -U $OAUTH_GITHUB_DB_USER -d $OAUTH_GITHUB_DB_NAME -h $OAUTH_GITHUB_DB_HOST -c "DELETE FROM oauth_github_app_user;" 

#twofactor
echo -e "________TWO FACTOR CONTAINER_________\n" 
docker exec -e PGPASSWORD=$TWOFACTOR_DB_PASSWORD twofactor psql -U $TWOFACTOR_DB_USER -d $TWOFACTOR_DB_NAME -h $TWOFACTOR_DB_HOST -c "DELETE FROM twofactor_app_user;" 

#user
echo -e "_________USER CONTAINER_________\n" 
docker exec -e PGPASSWORD=$USER_DB_PASSWORD user psql -U $USER_DB_USER -d $USER_DB_NAME -h $USER_DB_HOST -c "DELETE FROM user_app_user;" 

#chat
echo -e "_________CHAT CONTAINER_________\n" 
docker exec -e PGPASSWORD=$CHAT_DB_PASSWORD chat psql -U $CHAT_DB_USER -d $CHAT_DB_NAME -h $CHAT_DB_HOST -c "DELETE FROM chat_app_user;" 

#friends
echo -e "_________FRIENDS CONTAINER_________\n" 
docker exec -e PGPASSWORD=$FRIENDS_DB_PASSWORD friends psql -U $FRIENDS_DB_USER -d $FRIENDS_DB_NAME -h $FRIENDS_DB_HOST -c "DELETE FROM friends_app_user; DELETE FROM friends_app_friendlist; DELETE FROM friends_app_friendlist_friends;" 

#notifications
echo -e "_________NOTIFICATIONS CONTAINER_________\n" 
docker exec -e PGPASSWORD=$NOTIFICATIONS_DB_PASSWORD notifications psql -U $NOTIFICATIONS_DB_USER -d $NOTIFICATIONS_DB_NAME -h $NOTIFICATIONS_DB_HOST -c "DELETE FROM notifications_app_user; DELETE FROM notifications_app_notification;" 

#matchmaking
echo -e "_________MATCHMAKING CONTAINER_________\n" 
docker exec -e PGPASSWORD=$MATCHMAKING_DB_PASSWORD matchmaking psql -U $MATCHMAKING_DB_USER -d $MATCHMAKING_DB_NAME -h $MATCHMAKING_DB_HOST -c "DELETE FROM matchmaking_app_user;" 

#statistics
echo -e "_________STATISTICS CONTAINER_________\n" 
docker exec -e PGPASSWORD=$STATISTICS_DB_PASSWORD statistics psql -U $STATISTICS_DB_USER -d $STATISTICS_DB_NAME -h $STATISTICS_DB_HOST -c "DELETE FROM statistics_app_user;" 

#tournament
echo -e "_________TOURNAMENT CONTAINER_________\n" 
docker exec -e PGPASSWORD=$TOURNAMENT_DB_PASSWORD tournament psql -U $TOURNAMENT_DB_USER -d $TOURNAMENT_DB_NAME -h $TOURNAMENT_DB_HOST -c "DELETE FROM tournament_app_user;" 

#! /bin/bash
# Load environment variables from .env file
export $(grep -v '^#' ./src/backend/.env | xargs)

#chat_app_user
# echo -e "_________CHAT_APP_USER_________\n"
# docker exec -e PGPASSWORD=$CHAT_DB_PASSWORD chat psql -U $CHAT_DB_USER -d $CHAT_DB_NAME -h $CHAT_DB_HOST -c "DELETE FROM chat_app_user;"

#chat_app_user_blocked_users
echo -e "_________CHAT_APP_BLOCK_________\n" 
docker exec -e PGPASSWORD=$CHAT_DB_PASSWORD chat psql -U $CHAT_DB_USER -d $CHAT_DB_NAME -h $CHAT_DB_HOST -c "DELETE FROM chat_app_block;" 

#chat_app_chatgroup_members
echo -e "_________CHAT_APP_CHATGROUP_MEMBERS_________\n"
docker exec -e PGPASSWORD=$CHAT_DB_PASSWORD chat psql -U $CHAT_DB_USER -d $CHAT_DB_NAME -h $CHAT_DB_HOST -c "DELETE FROM chat_app_chatgroup_members;"

#chat_app_groupmessage
echo -e "_________CHAT_APP_GROUPMESSAGE_________\n"
docker exec -e PGPASSWORD=$CHAT_DB_PASSWORD chat psql -U $CHAT_DB_USER -d $CHAT_DB_NAME -h $CHAT_DB_HOST -c "DELETE FROM chat_app_groupmessage;"

#chat_app_chatgroup
echo -e "_________CHAT_APP_CHATGROUP_________\n"
docker exec -e PGPASSWORD=$CHAT_DB_PASSWORD chat psql -U $CHAT_DB_USER -d $CHAT_DB_NAME -h $CHAT_DB_HOST -c "DELETE FROM chat_app_chatgroup;"

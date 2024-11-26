#! /bin/bash
# Load environment variables from .env file
export $(grep -v '^#' ./src/backend/.env | xargs)

touch chat_models.txt

#chat_app_user
echo -e "_________CHAT_APP_USER_________\n" >> chat_models.txt
docker exec -e PGPASSWORD=$CHAT_DB_PASSWORD chat psql -U $CHAT_DB_USER -d $CHAT_DB_NAME -h $CHAT_DB_HOST -c "SELECT * FROM chat_app_user;" >> chat_models.txt

#chat_app_block
echo -e "_________CHAT_APP_BLOCK_________\n" >> chat_models.txt
docker exec -e PGPASSWORD=$CHAT_DB_PASSWORD chat psql -U $CHAT_DB_USER -d $CHAT_DB_NAME -h $CHAT_DB_HOST -c "SELECT * FROM chat_app_block;" >> chat_models.txt

#chat_app_chatgroup
echo -e "_________CHAT_APP_CHATGROUP_________\n" >> chat_models.txt
docker exec -e PGPASSWORD=$CHAT_DB_PASSWORD chat psql -U $CHAT_DB_USER -d $CHAT_DB_NAME -h $CHAT_DB_HOST -c "SELECT * FROM chat_app_chatgroup;" >> chat_models.txt

#chat_app_chatgroup_members
echo -e "_________CHAT_APP_CHATGROUP_MEMBERS_________\n" >> chat_models.txt
docker exec -e PGPASSWORD=$CHAT_DB_PASSWORD chat psql -U $CHAT_DB_USER -d $CHAT_DB_NAME -h $CHAT_DB_HOST -c "SELECT * FROM chat_app_chatgroup_members;" >> chat_models.txt

#chat_app_groupmessage
echo -e "_________CHAT_APP_GROUPMESSAGE_________\n" >> chat_models.txt
docker exec -e PGPASSWORD=$CHAT_DB_PASSWORD chat psql -U $CHAT_DB_USER -d $CHAT_DB_NAME -h $CHAT_DB_HOST -c "SELECT * FROM chat_app_groupmessage;" >> chat_models.txt

echo "***************************************************************************************************************************" >> chat_models.txt

#! /bin/bash
# Load environment variables from .env file
export $(grep -v "^#" ./src/backend/.env | xargs)

touch statistics_models.txt

#statistics_app_user
echo -e "_________statistics_APP_USER_________\n" >> statistics_models.txt
docker exec -e PGPASSWORD=$STATISTICS_DB_PASSWORD statistics psql -U $STATISTICS_DB_USER -d $STATISTICS_DB_NAME -h $STATISTICS_DB_HOST -c "SELECT * FROM statistics_app_user;" >> statistics_models.txt

echo "***************************************************************************************************************************" >> statistics_models.txt
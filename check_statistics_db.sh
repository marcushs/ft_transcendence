#! /bin/bash
# Load environment variables from .env file
# export $(grep -v "^#" ./src/backend/.env | xargs)

touch statistics_models.txt

#statistics_app_user
echo -e "_________statistics_APP_USER_________\n" >> statistics_models.txt
docker exec -e PGPASSWORD=qmg2H79VUGR2nyx statistics psql -U acarlott -d statistics_db -h statistics_db -c "SELECT * FROM statistics_app_user;" >> statistics_models.txt

echo "***************************************************************************************************************************" >> statistics_models.txt
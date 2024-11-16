#! /bin/bash
# Load environment variables from .env file
# export $(grep -v "^#" ./src/backend/.env | xargs)

#statistics_app_user
echo -e "_________statistics_APP_MATCHHISTORY_________\n"
docker exec -e PGPASSWORD=qmg2H79VUGR2nyx statistics psql -U acarlott -d statistics_db -h statistics_db -c "DELETE FROM statistics_app_matchhistory;"


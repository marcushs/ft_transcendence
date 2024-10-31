#! /bin/bash
# Load environment variables from .env file
export $(grep -v '^#' ./src/backend/.env | xargs)

#tournament_app_tournament_match
echo -e "_________TOURNAMENT_APP_TOURNAMENTMATCH_________\n"
docker exec -e PGPASSWORD=$TOURNAMENT_DB_PASSWORD tournament psql -U $TOURNAMENT_DB_USER -d $TOURNAMENT_DB_NAME -h $TOURNAMENT_DB_HOST -c "DELETE FROM tournament_app_tournamentmatch;"

#tournament_app_tournament_members
echo -e "_________TOURNAMENT_APP_TOURNAMENT_MEMBERS_________\n"
docker exec -e PGPASSWORD=$TOURNAMENT_DB_PASSWORD tournament psql -U $TOURNAMENT_DB_USER -d $TOURNAMENT_DB_NAME -h $TOURNAMENT_DB_HOST -c "DELETE FROM tournament_app_tournament_members;"

#tournament_app_tournament
echo -e "_________TOURNAMENT_APP_TOURNAMENT_________\n"
docker exec -e PGPASSWORD=$TOURNAMENT_DB_PASSWORD tournament psql -U $TOURNAMENT_DB_USER -d $TOURNAMENT_DB_NAME -h $TOURNAMENT_DB_HOST -c "DELETE FROM tournament_app_tournament;"

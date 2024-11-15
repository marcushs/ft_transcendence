#! /bin/bash
# Load environment variables from .env file
export $(grep -v '^#' ./src/backend/.env | xargs)


#tournament_app_tournamentmatch_players
echo -e "_________TOURNAMENT_APP_TOURNAMENTMATCH_PLAYERS_________\n"
docker exec -e PGPASSWORD=$TOURNAMENT_DB_PASSWORD tournament psql -U $TOURNAMENT_DB_USER -d $TOURNAMENT_DB_NAME -h $TOURNAMENT_DB_HOST -c "DELETE FROM tournament_app_tournamentmatch_players;"

#tournament_app_tournamentmatchplayers
echo -e "_________TOURNAMENT_APP_TOURNAMENTMATCHPLAYERS_________\n"
docker exec -e PGPASSWORD=$TOURNAMENT_DB_PASSWORD tournament psql -U $TOURNAMENT_DB_USER -d $TOURNAMENT_DB_NAME -h $TOURNAMENT_DB_HOST -c "DELETE FROM tournament_app_tournamentmatchplayer;"

#tournament_app_bracket_eighth_finals
echo -e "_________TOURNAMENT_APP_BRACKET_EIGHTH_FINALS_________\n"
docker exec -e PGPASSWORD=$TOURNAMENT_DB_PASSWORD tournament psql -U $TOURNAMENT_DB_USER -d $TOURNAMENT_DB_NAME -h $TOURNAMENT_DB_HOST -c "DELETE FROM tournament_app_bracket_eighth_finals;"

#tournament_app_bracket_quarter_finals
echo -e "_________TOURNAMENT_APP_BRACKET_QUARTER_FINALS_________\n"
docker exec -e PGPASSWORD=$TOURNAMENT_DB_PASSWORD tournament psql -U $TOURNAMENT_DB_USER -d $TOURNAMENT_DB_NAME -h $TOURNAMENT_DB_HOST -c "DELETE FROM tournament_app_bracket_quarter_finals;"

#tournament_app_bracket_semi_finals
echo -e "_________TOURNAMENT_APP_BRACKET_SEMI_FINALS_________\n"
docker exec -e PGPASSWORD=$TOURNAMENT_DB_PASSWORD tournament psql -U $TOURNAMENT_DB_USER -d $TOURNAMENT_DB_NAME -h $TOURNAMENT_DB_HOST -c "DELETE FROM tournament_app_bracket_semi_finals;"

#tournament_app_bracket_finals
echo -e "_________TOURNAMENT_APP_BRACKET_FINALS_________\n"
docker exec -e PGPASSWORD=$TOURNAMENT_DB_PASSWORD tournament psql -U $TOURNAMENT_DB_USER -d $TOURNAMENT_DB_NAME -h $TOURNAMENT_DB_HOST -c "DELETE FROM tournament_app_bracket_finals;"

#tournament_app_bracket
echo -e "_________TOURNAMENT_APP_BRACKET_________\n"
docker exec -e PGPASSWORD=$TOURNAMENT_DB_PASSWORD tournament psql -U $TOURNAMENT_DB_USER -d $TOURNAMENT_DB_NAME -h $TOURNAMENT_DB_HOST -c "DELETE FROM tournament_app_bracket;"

#tournament_app_tournament_match_players
echo -e "_________TOURNAMENT_APP_TOURNAMENTMATCH_PLAYERS_________\n"
docker exec -e PGPASSWORD=$TOURNAMENT_DB_PASSWORD tournament psql -U $TOURNAMENT_DB_USER -d $TOURNAMENT_DB_NAME -h $TOURNAMENT_DB_HOST -c "DELETE FROM tournament_app_tournamentmatch_players;"

#tournament_app_tournament_match
echo -e "_________TOURNAMENT_APP_TOURNAMENTMATCH_________\n"
docker exec -e PGPASSWORD=$TOURNAMENT_DB_PASSWORD tournament psql -U $TOURNAMENT_DB_USER -d $TOURNAMENT_DB_NAME -h $TOURNAMENT_DB_HOST -c "DELETE FROM tournament_app_tournamentmatch;"

#tournament_app_tournament_members
echo -e "_________TOURNAMENT_APP_TOURNAMENT_MEMBERS_________\n"
docker exec -e PGPASSWORD=$TOURNAMENT_DB_PASSWORD tournament psql -U $TOURNAMENT_DB_USER -d $TOURNAMENT_DB_NAME -h $TOURNAMENT_DB_HOST -c "DELETE FROM tournament_app_tournament_members;"

#tournament_app_tournament
echo -e "_________TOURNAMENT_APP_TOURNAMENT_________\n"
docker exec -e PGPASSWORD=$TOURNAMENT_DB_PASSWORD tournament psql -U $TOURNAMENT_DB_USER -d $TOURNAMENT_DB_NAME -h $TOURNAMENT_DB_HOST -c "DELETE FROM tournament_app_tournament;"

#tournament_app_matchready
# echo -e "_________TOURNAMENT_APP_MATCHREADY_________\n"
# docker exec -e PGPASSWORD=$TOURNAMENT_DB_PASSWORD tournament psql -U $TOURNAMENT_DB_USER -d $TOURNAMENT_DB_NAME -h $TOURNAMENT_DB_HOST -c "DELETE FROM tournament_app_matchready;"

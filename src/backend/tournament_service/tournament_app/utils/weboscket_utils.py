from ..consumers import connections, connections_lock
from asgiref.sync import sync_to_async, async_to_sync
from django.shortcuts import aget_object_or_404
from ..models import Tournament, User, Bracket
from channels.layers import get_channel_layer
from django.http import Http404
import json


async def send_websocket_info(player_id, payload):
  try:
      if isinstance(payload, str):
          payload = json.loads(payload)
      channel_layer = get_channel_layer()
      await channel_layer.group_send(
          f'tournament_{player_id}',
          payload
      )
  except Exception as e:
    print(f'Error : {str(e)}')


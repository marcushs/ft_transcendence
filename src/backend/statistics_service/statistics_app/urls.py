from django.urls import path
from .match_result import MatchResultManager

urlpatterns = [
    path('match_result/', MatchResultManager.as_view(), name='match_result'),
]
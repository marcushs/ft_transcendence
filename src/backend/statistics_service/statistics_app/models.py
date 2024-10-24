from django.utils import timezone
from django.conf import settings
from django.db import models

class MatchHistory(models.Model):
    match_type_choices = [
        ('ranked', 'Ranked'),
        ('unranked', 'Unranked')
    ]
    winner = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='won_matches', on_delete=models.CASCADE)
    loser = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='lost_matches', on_delete=models.CASCADE)
    date = models.DateTimeField(default=timezone.now)
    winner_score = models.IntegerField()
    loser_score = models.IntegerField()
    match_type = models.CharField(max_length=10, choices=match_type_choices)
    
    def __str__(self): 
        return f'winner: {self.winner} vs loser: {self.loser} on {self.date} ({self.match_type})'
    
    class Meta:
        ordering = ['-date']


class UserStats(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='stats')
    rank_points = models.IntegerField(default=0)
    games_won = models.IntegerField(default=0)
    games_lost = models.IntegerField(default=0)

    def __str__(self):
        return f"Stats for {self.user} - Rank Points: {self.rank_points}, Wins: {self.games_won}, Losses: {self.games_lost}"
        
    @property
    def match_history(self):
        return MatchHistory.objects.filter(models.Q(winner=self.user) | models.Q(loser=self.user))
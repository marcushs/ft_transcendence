from django.urls import path

from . import views


urlpatterns = [
    path("", views.chat.as_view(), name="chat"),
]

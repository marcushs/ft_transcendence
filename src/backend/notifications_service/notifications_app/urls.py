from django.urls import path
from .views import manage_notification
from .utils import user_utils

urlpatterns = [
    path('manage_notifications/', manage_notification.manage_notification_view.as_view(), name='manage_notifications'),
    path('add_user/', user_utils.add_new_user.as_view(), name='add_user'),
    path('update_user/', user_utils.update_user.as_view(), name='update_user'),
    path('check_username/', user_utils.check_username.as_view(), name='check_username'),
]

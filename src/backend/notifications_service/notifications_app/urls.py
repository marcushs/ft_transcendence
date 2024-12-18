from django.urls import path
from .views import manage_notification
from .utils import user_utils

urlpatterns = [
    path('delete_user/', user_utils.DeleteUser.as_view(), name='delete_user'),
    path('manage_notifications/', manage_notification.manage_notification_view.as_view(), name='manage_notifications'),
    path('add_user/', user_utils.AddNewUser.as_view(), name='add_user'),
    path('update_user/', user_utils.update_user.as_view(), name='update_user'),
]

from django.urls import re_path  # type: ignore
from apps.communications import consumers  # type: ignore

websocket_urlpatterns = [
    re_path(r'ws/timetable/$', consumers.TimetableConsumer.as_asgi()),
    re_path(r'ws/chat/$', consumers.ChatConsumer.as_asgi()),
    re_path(r'ws/notifications/$', consumers.NotificationConsumer.as_asgi()),
]

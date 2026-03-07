import json
from channels.generic.websocket import AsyncWebsocketConsumer  # type: ignore

class TimetableConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.group_name = "timetable_updates"
        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )

    async def timetable_message(self, event):
        message = event['message']
        await self.send(text_data=json.dumps({
            'type': 'timetable_update',
            'message': message
        }))

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope["user"]
        if self.user.is_anonymous:
            await self.accept()
            await self.close(code=4401)
            return
            
        self.group_name = f"user_{self.user.id}"
        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        if hasattr(self, 'group_name'):
            await self.channel_layer.group_discard(
                self.group_name,
                self.channel_name
            )

    async def chat_message(self, event):
        message = event['message']
        await self.send(text_data=json.dumps({
            'type': 'new_message',
            'message': message
        }))

class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope["user"]
        if self.user.is_anonymous:
            await self.accept()
            await self.close(code=4401)
            return
            
        self.group_name = f"notification_{self.user.id}"
        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        if hasattr(self, 'group_name'):
            await self.channel_layer.group_discard(
                self.group_name,
                self.channel_name
            )

    async def notification_message(self, event):
        message = event['message']
        await self.send(text_data=json.dumps({
            'type': 'new_notification',
            'message': message
        }))


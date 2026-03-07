from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

from apps.timetable.models import TimetableEntry, ClassCancellation, SubstituteFaculty
from apps.communications.models import Announcement

def broadcast_timetable_update():
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        'timetable_updates',
        {
            'type': 'timetable_message',
            'message': 'Timetable data has been updated.'
        }
    )

@receiver([post_save, post_delete], sender=TimetableEntry)
def timetable_entry_changed(sender, instance, **kwargs):
    broadcast_timetable_update()

@receiver([post_save, post_delete], sender=ClassCancellation)
def class_cancellation_changed(sender, instance, **kwargs):
    broadcast_timetable_update()

@receiver([post_save, post_delete], sender=SubstituteFaculty)
def substitute_faculty_changed(sender, instance, **kwargs):
    broadcast_timetable_update()

@receiver([post_save, post_delete], sender=Announcement)
def announcement_changed(sender, instance, **kwargs):
    broadcast_timetable_update()

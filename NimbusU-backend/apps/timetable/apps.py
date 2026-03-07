from django.apps import AppConfig


class TimetableConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.timetable"
    verbose_name = "Timetable"

    def ready(self):
        import apps.timetable.signals

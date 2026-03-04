from django.contrib import admin
from .models import RequestLog


@admin.register(RequestLog)
class RequestLogAdmin(admin.ModelAdmin):
    list_display = ("method", "path", "status_code", "response_time_ms", "user", "created_at")
    list_filter = ("method", "status_code", "created_at")
    search_fields = ("path", "user__email")
    readonly_fields = ("id", "method", "path", "status_code", "response_time_ms", "user", "ip_address", "user_agent", "created_at")
    ordering = ("-created_at",)

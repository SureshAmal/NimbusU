"""Models for the telemetry app."""

import uuid

from django.conf import settings
from django.db import models


class RequestLog(models.Model):
    """Captures every API request for telemetry and analytics."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    method = models.CharField(max_length=10)
    path = models.CharField(max_length=500)
    status_code = models.SmallIntegerField()
    response_time_ms = models.FloatField(help_text="Response time in milliseconds")
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="request_logs",
    )
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.CharField(max_length=500, blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "request_logs"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["-created_at", "path"], name="idx_reqlog_created_path"),
            models.Index(fields=["status_code"], name="idx_reqlog_status"),
        ]

    def __str__(self):
        return f"{self.method} {self.path} → {self.status_code} ({self.response_time_ms:.0f}ms)"

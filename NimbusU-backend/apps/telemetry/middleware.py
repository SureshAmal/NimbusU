"""Middleware to automatically log API requests for telemetry."""

import time


class TelemetryMiddleware:
    """Capture timing and metadata for every /api/ request."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Only track API requests
        if not request.path.startswith("/api/"):
            return self.get_response(request)

        # Skip the telemetry endpoint itself to avoid recursion
        if "/admin/telemetry" in request.path:
            return self.get_response(request)

        start = time.perf_counter()
        response = self.get_response(request)
        duration_ms = (time.perf_counter() - start) * 1000

        # Defer DB write to avoid slowing down the request
        try:
            from .models import RequestLog

            user = request.user if hasattr(request, "user") and request.user.is_authenticated else None

            # Extract client IP
            x_forwarded = request.META.get("HTTP_X_FORWARDED_FOR")
            ip = x_forwarded.split(",")[0].strip() if x_forwarded else request.META.get("REMOTE_ADDR")

            RequestLog.objects.create(
                method=request.method,
                path=request.path,
                status_code=response.status_code,
                response_time_ms=round(duration_ms, 2),
                user=user,
                ip_address=ip,
                user_agent=request.META.get("HTTP_USER_AGENT", "")[:500],
            )
        except Exception:
            pass  # Never break the request pipeline

        return response

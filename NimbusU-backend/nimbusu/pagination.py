"""Custom pagination classes for NimbusU."""

from rest_framework.pagination import PageNumberPagination


class FlexiblePageNumberPagination(PageNumberPagination):
    """PageNumberPagination that supports ?page_size=N in query params."""

    page_size_query_param = "page_size"
    max_page_size = 1000

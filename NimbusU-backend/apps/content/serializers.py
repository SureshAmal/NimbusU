"""Serializers for the content app."""

from django.utils import timezone
from rest_framework import serializers

from .models import Bookmark, Content, ContentAccessLog, ContentComment, ContentFolder, ContentTag, ContentVersion


class ContentTagSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContentTag
        fields = ["id", "name"]
        read_only_fields = ["id"]


class ContentFolderSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(
        source="created_by.full_name", read_only=True
    )

    class Meta:
        model = ContentFolder
        fields = [
            "id", "name", "parent", "created_by", "created_by_name",
            "course_offering", "visibility", "created_at",
        ]
        read_only_fields = ["id", "created_at", "created_by"]


class ContentListSerializer(serializers.ModelSerializer):
    """Lightweight content serializer for listings."""

    uploaded_by_name = serializers.CharField(
        source="uploaded_by.full_name", read_only=True
    )
    folder_name = serializers.CharField(source="folder.name", read_only=True, default=None)
    course_name = serializers.CharField(source="course_offering.course.name", read_only=True, default=None)
    course_code = serializers.CharField(source="course_offering.course.code", read_only=True, default=None)
    semester_name = serializers.CharField(source="course_offering.semester.name", read_only=True, default=None)
    tags = ContentTagSerializer(many=True, read_only=True)
    version_count = serializers.IntegerField(read_only=True)
    comment_count = serializers.IntegerField(read_only=True)
    bookmark_count = serializers.IntegerField(read_only=True)
    total_views = serializers.IntegerField(read_only=True)
    total_downloads = serializers.IntegerField(read_only=True)
    is_expired = serializers.SerializerMethodField()
    is_scheduled = serializers.SerializerMethodField()

    class Meta:
        model = Content
        fields = [
            "id", "title", "content_type", "file_size", "mime_type",
            "uploaded_by", "uploaded_by_name", "course_offering",
            "course_name", "course_code", "semester_name", "folder", "folder_name",
            "visibility", "is_published", "publish_at", "expires_at",
            "tags", "version_count", "comment_count", "bookmark_count",
            "total_views", "total_downloads", "is_expired", "is_scheduled",
            "created_at", "updated_at",
        ]
        read_only_fields = ["id", "created_at"]

    def get_is_expired(self, obj) -> bool:
        return bool(obj.expires_at and obj.expires_at <= timezone.now())

    def get_is_scheduled(self, obj) -> bool:
        return bool(obj.publish_at and obj.publish_at > timezone.now())


class ContentDetailSerializer(serializers.ModelSerializer):
    """Full content serializer."""

    uploaded_by_name = serializers.CharField(
        source="uploaded_by.full_name", read_only=True
    )
    tags = ContentTagSerializer(many=True, read_only=True)
    tag_ids = serializers.PrimaryKeyRelatedField(
        queryset=ContentTag.objects.all(),
        many=True,
        write_only=True,
        required=False,
        source="tags",
    )

    class Meta:
        model = Content
        fields = [
            "id", "title", "description", "content_type",
            "file", "file_size", "mime_type", "external_url",
            "folder", "course_offering", "uploaded_by", "uploaded_by_name",
            "visibility", "tags", "tag_ids", "publish_at", "expires_at",
            "is_published", "created_at", "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at", "uploaded_by"]


class ContentAccessLogSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source="user.full_name", read_only=True)

    class Meta:
        model = ContentAccessLog
        fields = ["id", "content", "user", "user_name", "action", "duration_seconds", "created_at"]
        read_only_fields = ["id", "created_at"]


class BookmarkSerializer(serializers.ModelSerializer):
    content_title = serializers.CharField(source="content.title", read_only=True)
    content_type = serializers.CharField(source="content.content_type", read_only=True)

    class Meta:
        model = Bookmark
        fields = ["id", "user", "content", "content_title", "content_type", "created_at"]
        read_only_fields = ["id", "created_at", "user"]


class ContentVersionSerializer(serializers.ModelSerializer):
    uploaded_by_name = serializers.CharField(source="uploaded_by.full_name", read_only=True)

    class Meta:
        model = ContentVersion
        fields = [
            "id", "content", "version_number", "file", "file_size",
            "change_summary", "uploaded_by", "uploaded_by_name", "created_at",
        ]
        read_only_fields = ["id", "created_at", "uploaded_by", "version_number"]


class ContentCommentSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source="author.full_name", read_only=True)
    reply_count = serializers.SerializerMethodField()

    class Meta:
        model = ContentComment
        fields = [
            "id", "content", "author", "author_name", "parent",
            "body", "is_resolved", "reply_count",
            "created_at", "updated_at",
        ]
        read_only_fields = ["id", "author", "created_at", "updated_at"]

    def get_reply_count(self, obj) -> int:
        return obj.replies.count()

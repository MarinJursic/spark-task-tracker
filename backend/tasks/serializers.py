from rest_framework import serializers

from tasks.models import Task, TeamMember


class TeamMemberSerializer(serializers.ModelSerializer):
    initials = serializers.CharField(read_only=True)

    class Meta:
        model = TeamMember
        fields = ("id", "name", "role", "initials")


class TaskSerializer(serializers.ModelSerializer):
    assignee = TeamMemberSerializer(read_only=True)
    assignee_id = serializers.PrimaryKeyRelatedField(
        queryset=TeamMember.objects.all(),
        source="assignee",
        write_only=True,
    )

    class Meta:
        model = Task
        fields = (
            "id",
            "title",
            "description",
            "assignee",
            "assignee_id",
            "completed",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "created_at", "updated_at")

    def validate_title(self, value: str) -> str:
        return value.strip()

    def validate_description(self, value: str) -> str:
        return value.strip()

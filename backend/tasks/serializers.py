from rest_framework import serializers

from tasks.models import Task, TeamMember


class TeamMemberSerializer(serializers.ModelSerializer):
    initials = serializers.CharField(read_only=True)

    class Meta:
        model = TeamMember
        fields = ("id", "name", "role", "initials")


class TaskSerializer(serializers.ModelSerializer):
    completed = serializers.BooleanField(required=False)
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
            "status",
            "completed",
            "priority",
            "due_date",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "created_at", "updated_at")

    def validate_title(self, value: str) -> str:
        return value.strip()

    def validate_description(self, value: str) -> str:
        return value.strip()

    def validate(self, attrs: dict) -> dict:
        completed = attrs.pop("completed", None)
        selected_status = attrs.get("status")

        if completed is not None:
            compatible_statuses = (
                {Task.Status.DONE} if completed else {Task.Status.TODO, Task.Status.IN_PROGRESS}
            )
            if selected_status and selected_status not in compatible_statuses:
                raise serializers.ValidationError(
                    {"completed": "Completed must agree with the selected workflow status."}
                )
            if not selected_status:
                attrs["status"] = Task.Status.DONE if completed else Task.Status.TODO

        return attrs

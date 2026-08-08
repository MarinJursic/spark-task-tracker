from django.db.models import Q, QuerySet
from rest_framework import mixins, viewsets
from rest_framework.exceptions import ValidationError

from tasks.models import Task, TeamMember
from tasks.serializers import TaskSerializer, TeamMemberSerializer


class TeamMemberViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    queryset = TeamMember.objects.all()
    serializer_class = TeamMemberSerializer


class TaskViewSet(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet,
):
    serializer_class = TaskSerializer
    queryset = Task.objects.select_related("assignee")

    def get_queryset(self) -> QuerySet[Task]:
        queryset = self.queryset.all()
        status = self.request.query_params.get("status", "all")
        priority = self.request.query_params.get("priority", "all")
        search = self.request.query_params.get("q", "").strip()

        valid_statuses = {"all", "open", "completed", *Task.Status.values}
        if status not in valid_statuses:
            raise ValidationError(
                {"status": "Use all, open, completed, todo, in_progress, or done."}
            )
        if priority not in {"all", *Task.Priority.values}:
            raise ValidationError({"priority": "Use all, low, medium, or high."})
        if len(search) > 100:
            raise ValidationError({"q": "Search must be 100 characters or fewer."})

        if status == "open":
            queryset = queryset.exclude(status=Task.Status.DONE)
        elif status == "completed":
            queryset = queryset.filter(status=Task.Status.DONE)
        elif status != "all":
            queryset = queryset.filter(status=status)
        if priority != "all":
            queryset = queryset.filter(priority=priority)
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) | Q(description__icontains=search)
            )

        return queryset

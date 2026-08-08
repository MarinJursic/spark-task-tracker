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
        search = self.request.query_params.get("q", "").strip()

        if status not in {"all", "open", "completed"}:
            raise ValidationError({"status": "Use all, open, or completed."})
        if len(search) > 100:
            raise ValidationError({"q": "Search must be 100 characters or fewer."})

        if status != "all":
            queryset = queryset.filter(completed=status == "completed")
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) | Q(description__icontains=search)
            )

        return queryset

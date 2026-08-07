import uuid

from django.db import models


class TeamMember(models.Model):
    name = models.CharField(max_length=80, unique=True)
    role = models.CharField(max_length=80)

    class Meta:
        ordering = ["name"]

    def __str__(self) -> str:
        return self.name

    @property
    def initials(self) -> str:
        return "".join(part[0] for part in self.name.split()[:2]).upper()


class Task(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=120)
    description = models.TextField(max_length=1000)
    assignee = models.ForeignKey(TeamMember, on_delete=models.PROTECT, related_name="tasks")
    completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["completed", "-updated_at"]

    def __str__(self) -> str:
        return self.title

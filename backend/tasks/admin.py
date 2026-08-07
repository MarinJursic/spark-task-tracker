from django.contrib import admin

from tasks.models import Task, TeamMember


@admin.register(TeamMember)
class TeamMemberAdmin(admin.ModelAdmin):
    list_display = ("name", "role")
    search_fields = ("name", "role")


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ("title", "assignee", "completed", "updated_at")
    list_filter = ("completed", "assignee")
    search_fields = ("title", "description")

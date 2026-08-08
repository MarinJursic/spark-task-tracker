import datetime

from django.db import migrations, models


DEMO_UPDATES = {
    "Review Year 11 maths resources": ("in_progress", "high", datetime.date(2026, 8, 12)),
    "Prepare tutor onboarding checklist": ("todo", "medium", datetime.date(2026, 8, 15)),
    "Update parent progress summary": ("in_progress", "medium", datetime.date(2026, 8, 11)),
    "QA the weekly task list": ("done", "high", datetime.date(2026, 8, 8)),
}


def populate_workflow_fields(apps, schema_editor) -> None:
    task_model = apps.get_model("tasks", "Task")

    for task in task_model.objects.all():
        task.status = "done" if task.completed else "in_progress"
        if task.title in DEMO_UPDATES:
            task.status, task.priority, task.due_date = DEMO_UPDATES[task.title]
        task.save(update_fields=("status", "priority", "due_date"))


def restore_completed_field(apps, schema_editor) -> None:
    task_model = apps.get_model("tasks", "Task")
    for task in task_model.objects.all():
        task.completed = task.status == "done"
        task.save(update_fields=("completed",))


class Migration(migrations.Migration):
    dependencies = [("tasks", "0002_seed_demo_data")]

    operations = [
        migrations.AlterModelOptions(
            name="task",
            options={"ordering": ["status", "due_date", "-updated_at"]},
        ),
        migrations.AddField(
            model_name="task",
            name="status",
            field=models.CharField(
                choices=[("todo", "To do"), ("in_progress", "In progress"), ("done", "Done")],
                default="todo",
                max_length=20,
            ),
        ),
        migrations.AddField(
            model_name="task",
            name="priority",
            field=models.CharField(
                choices=[("low", "Low"), ("medium", "Medium"), ("high", "High")],
                default="medium",
                max_length=10,
            ),
        ),
        migrations.AddField(
            model_name="task",
            name="due_date",
            field=models.DateField(blank=True, null=True),
        ),
        migrations.RunPython(populate_workflow_fields, restore_completed_field),
        migrations.RemoveField(model_name="task", name="completed"),
    ]

from django.db import migrations


MEMBERS = (
    ("Amelia Hart", "Student Success Lead"),
    ("Daniel Okafor", "Tutor Operations"),
    ("Maya Chen", "Product Manager"),
    ("Noah Williams", "Curriculum Lead"),
)

TASKS = (
    (
        "Review Year 11 maths resources",
        "Check the new algebra practice set for clarity and curriculum coverage.",
        "Noah Williams",
        False,
    ),
    (
        "Prepare tutor onboarding checklist",
        "Consolidate the first-week actions into one concise checklist for new tutors.",
        "Daniel Okafor",
        False,
    ),
    (
        "Update parent progress summary",
        "Refine the weekly summary template so progress and next steps are easy to scan.",
        "Amelia Hart",
        False,
    ),
    (
        "QA the weekly task list",
        "Confirm assignments, status changes, and responsive layouts before release.",
        "Maya Chen",
        True,
    ),
)


def seed_demo_data(apps, schema_editor) -> None:
    team_member_model = apps.get_model("tasks", "TeamMember")
    task_model = apps.get_model("tasks", "Task")

    members = {
        name: team_member_model.objects.create(name=name, role=role) for name, role in MEMBERS
    }
    for title, description, assignee_name, completed in TASKS:
        task_model.objects.create(
            title=title,
            description=description,
            assignee=members[assignee_name],
            completed=completed,
        )


def remove_demo_data(apps, schema_editor) -> None:
    apps.get_model("tasks", "Task").objects.filter(title__in=[task[0] for task in TASKS]).delete()
    apps.get_model("tasks", "TeamMember").objects.filter(name__in=[member[0] for member in MEMBERS]).delete()


class Migration(migrations.Migration):
    dependencies = [("tasks", "0001_initial")]

    operations = [migrations.RunPython(seed_demo_data, remove_demo_data)]

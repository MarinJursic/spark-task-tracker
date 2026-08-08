from django.test import TestCase

from tasks.models import Task, TeamMember


class TeamMemberModelTests(TestCase):
    def test_initials_use_first_two_name_parts(self) -> None:
        member = TeamMember(name="Amelia Rose Hart", role="Lead")

        self.assertEqual(member.initials, "AR")


class TaskModelTests(TestCase):
    def test_string_representation_is_title(self) -> None:
        member = TeamMember.objects.create(name="Test Member", role="Tester")
        task = Task.objects.create(
            title="Verify task flow",
            description="Exercise the required workflow.",
            assignee=member,
        )

        self.assertEqual(str(task), "Verify task flow")
        self.assertFalse(task.completed)

        task.status = Task.Status.DONE
        self.assertTrue(task.completed)

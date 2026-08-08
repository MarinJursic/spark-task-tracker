from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from tasks.models import Task, TeamMember


class TaskApiTests(APITestCase):
    @classmethod
    def setUpTestData(cls) -> None:
        cls.member = TeamMember.objects.create(name="API Test Member", role="Engineer")
        cls.open_task = Task.objects.create(
            title="Test the task API",
            description="Cover the required task tracker behavior.",
            assignee=cls.member,
        )
        cls.completed_task = Task.objects.create(
            title="Document the API",
            description="Record the endpoint contract.",
            assignee=cls.member,
            completed=True,
        )

    def test_list_exposes_required_task_fields(self) -> None:
        response = self.client.get(reverse("task-list"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        task = next(item for item in response.data if item["id"] == str(self.open_task.id))
        self.assertEqual(task["title"], self.open_task.title)
        self.assertFalse(task["completed"])
        self.assertEqual(task["assignee"]["name"], self.member.name)

    def test_create_task(self) -> None:
        payload = {
            "title": "  Add a task  ",
            "description": "  Persist a new team task.  ",
            "assignee_id": self.member.id,
            "completed": False,
        }

        response = self.client.post(reverse("task-list"), payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        created = Task.objects.get(id=response.data["id"])
        self.assertEqual(created.title, "Add a task")
        self.assertEqual(created.description, "Persist a new team task.")

    def test_create_requires_title_description_and_assignee(self) -> None:
        response = self.client.post(reverse("task-list"), {}, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(set(response.data), {"title", "description", "assignee_id"})

        invalid_content_response = self.client.post(
            reverse("task-list"),
            {
                "title": "   ",
                "description": "   ",
                "assignee_id": 999_999,
            },
            format="json",
        )

        self.assertEqual(invalid_content_response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            set(invalid_content_response.data),
            {"title", "description", "assignee_id"},
        )

    def test_edit_task_and_reassign(self) -> None:
        new_member = TeamMember.objects.create(name="Second Test Member", role="Reviewer")
        url = reverse("task-detail", kwargs={"pk": self.open_task.id})

        response = self.client.patch(
            url,
            {"title": "Edited task", "assignee_id": new_member.id},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.open_task.refresh_from_db()
        self.assertEqual(self.open_task.title, "Edited task")
        self.assertEqual(self.open_task.assignee, new_member)

    def test_mark_task_complete_and_incomplete(self) -> None:
        url = reverse("task-detail", kwargs={"pk": self.open_task.id})

        complete_response = self.client.patch(url, {"completed": True}, format="json")
        self.assertEqual(complete_response.status_code, status.HTTP_200_OK)
        self.open_task.refresh_from_db()
        self.assertTrue(self.open_task.completed)

        incomplete_response = self.client.patch(url, {"completed": False}, format="json")
        self.assertEqual(incomplete_response.status_code, status.HTTP_200_OK)

        self.assertTrue(complete_response.data["completed"])
        self.open_task.refresh_from_db()
        self.assertFalse(incomplete_response.data["completed"])
        self.assertFalse(self.open_task.completed)

    def test_filter_by_status(self) -> None:
        response = self.client.get(reverse("task-list"), {"status": "completed"})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data)
        self.assertTrue(all(task["completed"] for task in response.data))

    def test_search_matches_title_or_description(self) -> None:
        response = self.client.get(reverse("task-list"), {"q": "endpoint contract"})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual([task["id"] for task in response.data], [str(self.completed_task.id)])

    def test_rejects_unknown_status_filter(self) -> None:
        response = self.client.get(reverse("task-list"), {"status": "archived"})

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("status", response.data)

        oversized_search_response = self.client.get(reverse("task-list"), {"q": "a" * 101})

        self.assertEqual(oversized_search_response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("q", oversized_search_response.data)

    def test_delete_task(self) -> None:
        url = reverse("task-detail", kwargs={"pk": self.open_task.id})

        response = self.client.delete(url)

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Task.objects.filter(pk=self.open_task.id).exists())


class TeamMemberApiTests(APITestCase):
    def test_list_returns_seeded_team_members(self) -> None:
        response = self.client.get(reverse("team-member-list"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 4)
        self.assertEqual(set(response.data[0]), {"id", "name", "role", "initials"})

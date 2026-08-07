from rest_framework.routers import DefaultRouter

from tasks.views import TaskViewSet, TeamMemberViewSet

router = DefaultRouter()
router.register("tasks", TaskViewSet, basename="task")
router.register("team-members", TeamMemberViewSet, basename="team-member")

urlpatterns = router.urls

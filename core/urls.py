from core.views import ExperienceViewSet
from rest_framework import routers
from django.urls import include, path
app_name = "core"

router = routers.DefaultRouter()
router.register(r"experience", ExperienceViewSet, basename="records")

# urls = []
urlpatterns = [
    # path("calendar", App.as_view(), name="app"),
    # path("", App.as_view(), name="app"),
    path("api/", include(router.urls))
]
# urlpatterns = router.urls  # + urls

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from apps.academics.models import StudentTask
from apps.accounts.models import User

class TestStudentTaskAPI(APITestCase):
    def setUp(self):
        self.student1 = User.objects.create_user(
            email="student1@test.com", password="password", role="student",
            first_name="Test", last_name="Student 1"
        )
        self.student2 = User.objects.create_user(
            email="student2@test.com", password="password", role="student",
            first_name="Test", last_name="Student 2"
        )
        self.task_url = reverse("academics:task-list-create")

    def test_create_and_list_tasks(self):
        self.client.force_authenticate(user=self.student1)
        
        # Create Task
        response = self.client.post(self.task_url, {
            "title": "Study for midterms",
            "is_completed": False
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["title"], "Study for midterms")
        self.assertEqual(str(response.data["student"]), str(self.student1.id))
        
        task_id = response.data["id"]
        
        # List Tasks for student1
        response = self.client.get(self.task_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["results"]), 1)
        
        # List Tasks for student2 (should be empty)
        self.client.force_authenticate(user=self.student2)
        response = self.client.get(self.task_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["results"]), 0)
        
    def test_update_and_delete_tasks(self):
        self.client.force_authenticate(user=self.student1)
        task = StudentTask.objects.create(
            student=self.student1,
            title="Read chapter 1"
        )
        
        detail_url = reverse("academics:task-detail", kwargs={"pk": task.id})
        
        # Update
        response = self.client.patch(detail_url, {"is_completed": True})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["is_completed"])
        
        # Delete
        response = self.client.delete(detail_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(StudentTask.objects.count(), 0)

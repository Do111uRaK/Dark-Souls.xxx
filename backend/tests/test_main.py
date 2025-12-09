import unittest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

class TestFastAPIEndpoints(unittest.TestCase):
    
    def test_root_endpoint(self):
        """Тест корневого эндпоинта"""
        response = client.get("/")
        self.assertEqual(response.status_code, 200)
        self.assertIn("message", response.json())
    
    def test_health_check(self):
        """Тест проверки здоровья сервиса"""
        response = client.get("/health")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["status"], "healthy")
    
    def test_auth_endpoints(self):
        """Тест эндпоинтов авторизации"""
        # Тест регистрации
        register_data = {"login": "test_user", "password": "test_pass"}
        response = client.post("/auth/register", json=register_data)
        self.assertIn(response.status_code, [200, 401])  # 401 если пользователь уже существует
        
        # Тест входа
        login_data = {"login": "test_user", "password": "test_pass"}
        response = client.post("/auth/login", json=login_data)
        self.assertIn(response.status_code, [200, 404])  # 404 если неверные данные
    
    def test_users_endpoints(self):
        """Тест эндпоинтов пользователей"""
        response = client.get("/users/")
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.json(), list)
    
    def test_posts_endpoints(self):
        """Тест эндпоинтов постов"""
        response = client.get("/posts/")
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.json(), list)

if __name__ == '__main__':
    unittest.main()
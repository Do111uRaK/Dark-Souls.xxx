document.getElementById('loginForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const login = document.getElementById('username').value;
    const password = document.getElementById('password').value;




    // Отправляем запрос к FastAPI бэкенду
    const response = await fetch('http://localhost:8000/users/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
        login: login,
        password: password
        })
    });
    const data = await response.json();
    if (response.status == 401) {
        alert('Пользователь с таким логином уже существует');
        return;
    }    
    if (response.ok) {
        // Сохраняем текущего пользователя и токен в сессию
        sessionStorage.setItem('currentUser', JSON.stringify(data.user));
        sessionStorage.setItem('authToken', data.access_token);
        
        alert(`Добро пожаловать, ${data.user.login}!`);
        window.location.href = '../dashboard.html';
    } else {
        // Ошибка аутентификации
        alert(data.detail || 'Неверный логин или пароль');
    }
});
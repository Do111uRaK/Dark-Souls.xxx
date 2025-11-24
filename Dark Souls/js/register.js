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
        const user = data;
        sessionStorage.setItem('currentUser', JSON.stringify(user));
        
        alert(`Добро пожаловать, ${user.login}!`);
    } else {
        // Ошибка аутентификации
        alert('Ошибка сервера');
    }
});
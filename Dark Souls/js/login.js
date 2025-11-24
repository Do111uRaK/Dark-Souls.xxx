document.getElementById('loginForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const login = document.getElementById('username').value;
    const password = document.getElementById('password').value;




    // Отправляем запрос к FastAPI бэкенду
    const response = await fetch('http://localhost:8000/auth/' + login + `?user_password=${encodeURIComponent(password)}`, {
        method: 'GET',
        //mode: 'no-cors', // This disables CORS checks for the request
        headers: {
            'Content-Type': 'application/json',
        },
    });
    const data = await response.json();

    if (response.status == 404) {
        alert('Пароль или логин неправильный');
        return;
    }
    if (response.status == 401) {
        alert('Ваш аккаунт заблокирован');
        return;
    }    
    if (response.ok) {
        // Сохраняем текущего пользователя и токен в сессию
        const user = data
        sessionStorage.setItem('currentUser', JSON.stringify(user));
        
        alert(`Добро пожаловать, ${user.login}!`);
    } else {
        // Ошибка аутентификации
        alert('Ошибка сервера');
    }
});
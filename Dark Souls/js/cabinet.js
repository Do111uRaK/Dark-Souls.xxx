document.addEventListener('DOMContentLoaded', function() {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    
    if (!currentUser) {
        window.location.href = 'authorization.html';
        return;
    }

    loadUserData();
    setupRoleSpecificFeatures();

    // Загрузка данных усера
    async function loadUserData() {
        try {
            const response = await fetch(`http://localhost:8000/users/${currentUser.login}`);
            if (!response.ok) throw new Error('Ошибка загрузки данных пользователя');
            
            const userData = await response.json();
            displayUserInfo(userData);
        } catch (error) {
            console.error('Ошибка:', error);
            document.getElementById('cabinet-title').textContent = 'Ошибка загрузки данных';
        }
    }

    // Отображение информации об усере
    function displayUserInfo(user) {
        const title = document.getElementById('cabinet-title');
        const userInfo = document.getElementById('user-info');
        
        // Определяем роль
        let roleText = 'Пользователь';
        let roleClass = 'role-user';
        
        if (user.role === 2) {
            roleText = 'Модератор';
            roleClass = 'role-moderator';
        } else if (user.role === 3) {
            roleText = 'Владелец';
            roleClass = 'role-owner';
        }
        
        title.textContent = `Личный кабинет: ${user.login}`;
        userInfo.innerHTML = `
            <p><strong>Логин:</strong> ${user.login}</p>
            <p><strong>Роль:</strong> <span class="role-badge ${roleClass}">${roleText}</span></p>
            <p><strong>Статус:</strong> ${user.is_banned ? 'Заблокирован' : 'Активен'}</p>
        `;
        userInfo.style.display = 'block';
    }

    // Настройка функций в зависимости от роли
    function setupRoleSpecificFeatures() {
        const role = currentUser.role;
        
        if (role === 1) { // Обычный пользователь
            document.getElementById('user-section').style.display = 'block';
            loadLikedPosts();
        } else if (role === 2) { // Модератор
            document.getElementById('moderator-section').style.display = 'block';
            setupPostForm();
            loadMyPosts();
        } else if (role === 3) { // Владелец
            document.getElementById('owner-section').style.display = 'block';
            document.getElementById('user-section').style.display = 'block';
            loadAllUsers();
            loadLikedPosts();
            loadSiteStats();
        }
    }

    async function loadSiteStats() {
    try {
        // Загружаем пользователей для подсчета
        const usersResponse = await fetch('http://localhost:8000/users/');
        const users = await usersResponse.json();
        
        // Загружаем посты для подсчета
        const postsResponse = await fetch('http://localhost:8000/posts/');
        const posts = await postsResponse.json();
        
        // Подсчитываем общее количество лайков
        const totalLikes = posts.reduce((sum, post) => {
            return sum + (post.likes_count || 0);
        }, 0);
        
        // Обновляем статистику на странице
        document.getElementById('total-users').textContent = users.length;
        document.getElementById('total-posts').textContent = posts.length;
        document.getElementById('total-likes').textContent = totalLikes;
        
    } catch (error) {
        console.error('Ошибка загрузки статистики:', error);
        document.getElementById('total-users').textContent = '—';
        document.getElementById('total-posts').textContent = '—';
        document.getElementById('total-likes').textContent = '—';
    }
    }

    // Загрузка лайкнутых постов для усеров
    async function loadLikedPosts() {
        try {
            const response = await fetch('http://localhost:8000/posts/');
            if (!response.ok) throw new Error('Ошибка загрузки постов');
            
            const allPosts = await response.json();
            const likedPostsContainer = document.getElementById('liked-posts');
            
            // Фильтруем лайкнутые посты 
            const likedPostIds = JSON.parse(localStorage.getItem(`liked_posts_${currentUser.id}`)) || [];
            const likedPosts = allPosts.filter(post => likedPostIds.includes(post.id));
            
            if (likedPosts.length === 0) {
                likedPostsContainer.innerHTML = '<p>Вы еще не лайкнули ни одного поста</p>';
                return;
            }
            
            displayPosts(likedPosts, likedPostsContainer);
        } catch (error) {
            console.error('Ошибка:', error);
            document.getElementById('liked-posts').innerHTML = '<p class="error">Ошибка загрузки постов</p>';
        }
    }

    // Настройка формы создания поста для модера
    function setupPostForm() {
        const form = document.getElementById('create-post-form');
        
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const title = document.getElementById('post-title').value;
            const content = document.getElementById('post-content').value;
            
            if (!title.trim() || !content.trim()) {
                alert('Заполните все поля');
                return;
            }
            
            try {
                const response = await fetch('http://localhost:8000/posts/create', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        title: title,
                        content: content,
                        author_id: currentUser.id
                    })
                });
                
                if (response.ok) {
                    alert('Пост успешно создан!');
                    form.reset();
                    loadMyPosts(); 
                } else {
                    const error = await response.json();
                    alert(error.detail || 'Ошибка создания поста');
                }
            } catch (error) {
                console.error('Ошибка:', error);
                alert('Ошибка сети');
            }
        });
    }

    // Загрузка постов модера
    async function loadMyPosts() {
        try {
            const response = await fetch('http://localhost:8000/posts/');
            if (!response.ok) throw new Error('Ошибка загрузки постов');
            
            const allPosts = await response.json();
            const myPostsContainer = document.getElementById('my-posts');
            
            // Фильтрация постов усера
            const myPosts = allPosts.filter(post => post.author_login === currentUser.login);
            if (myPosts.length === 0) {
                myPostsContainer.innerHTML = '<p>Вы еще не создали ни одного поста</p>';
                return;
            }
            
            displayPosts(myPosts, myPostsContainer);
        } catch (error) {
            console.error('Ошибка:', error);
            document.getElementById('my-posts').innerHTML = '<p class="error">Ошибка загрузки постов</p>';
        }
    }

    // Загрузка всех усеров для овнера
    async function loadAllUsers() {
        try {
            const response = await fetch('http://localhost:8000/users/');
            if (!response.ok) throw new Error('Ошибка загрузки пользователей');
            
            const users = await response.json();
            displayUsers(users);
        } catch (error) {
            console.error('Ошибка:', error);
            document.getElementById('users-list').innerHTML = '<tr><td colspan="5">Ошибка загрузки пользователей</td></tr>';
        }
    }

    // Отображение списка усеров
    function displayUsers(users) {
        const usersList = document.getElementById('users-list');
        usersList.innerHTML = '';
        
        users.forEach(user => {
            const row = document.createElement('tr');
            
            // Определение роли
            let roleText = 'Пользователь';
            if (user.role === 2) roleText = 'Модератор';
            else if (user.role === 3) roleText = 'Владелец';
            
            row.innerHTML = `
                <td>${user.id}</td>
                <td>${user.login}</td>
                <td>${roleText}</td>
                <td class="${user.is_banned ? 'status-banned' : 'status-active'}">
                    ${user.is_banned ? 'Заблокирован' : 'Активен'}
                </td>
                <td>
                    <div class="action-buttons">
                        ${user.id !== currentUser.id ? `
                            <button class="ds-button ban-btn" data-id="${user.id}" data-action="${user.is_banned ? 'unban' : 'ban'}">
                                ${user.is_banned ? 'Разблокировать' : 'Заблокировать'}
                            </button>
                        ` : 'Текущий пользователь'}
                    </div>
                </td>
            `;
            
            usersList.appendChild(row);
        });

        // обработчик бан анбан
        document.querySelectorAll('.ban-btn').forEach(btn => {
            btn.addEventListener('click', async function() {
                const userId = this.getAttribute('data-id');
                const action = this.getAttribute('data-action');
                
                await toggleUserBan(userId, action === 'ban');
            });
        });
    }

    // Бан анбан
    async function toggleUserBan(userId, shouldBan) {
        const endpoint = shouldBan ? '/users/ban' : '/users/unban';
        
        try {
            const response = await fetch(`http://localhost:8000${endpoint}?user_id=${userId}`, {
                method: 'PATCH'
            });
            
            if (response.ok) {
                alert(`Пользователь успешно ${shouldBan ? 'заблокирован' : 'разблокирован'}!`);
                loadAllUsers(); 
            } else {
                alert('Ошибка при изменении статуса пользователя');
            }
        } catch (error) {
            console.error('Ошибка:', error);
            alert('Ошибка сети');
        }
    }

    // Функция для отображения постов
    function displayPosts(posts, container) {
        container.innerHTML = '';
        
        posts.forEach(post => {
            const postCard = document.createElement('div');
            postCard.className = 'post-card';
            
            const excerpt = post.content.length > 100 ? 
                post.content.substring(0, 100) + '...' : 
                post.content;
            
            postCard.innerHTML = `
                <h3 class="post-title">${post.title}</h3>
                <div class="post-content">${excerpt}</div>
                ${post.content.length > 100 ? '<span class="read-more">Читать далее</span>' : ''}
                <div class="post-meta">
                    <span>Лайков: <span class="likes-count">${post.likes_count || 0}</span></span>
                    <button class="like-button" data-id="${post.id}">
                        ${isPostLiked(post.id) ? '❤️' : '🤍'}
                    </button>
                </div>
            `;
            
            container.appendChild(postCard);
        });

        // Читать далее
        container.querySelectorAll('.read-more').forEach(btn => {
            btn.addEventListener('click', function() {
                const content = this.previousElementSibling;
                content.classList.toggle('expanded');
                this.textContent = content.classList.contains('expanded') ? 'Свернуть' : 'Читать далее';
            });
        });

        // для лайков
        container.querySelectorAll('.like-button').forEach(btn => {
            btn.addEventListener('click', async function() {
                const postId = this.getAttribute('data-id');
                await toggleLike(postId, this);
            });
        });
    }

    // Проверка, лайкнут или не
    function isPostLiked(postId) {
        const likedPosts = JSON.parse(localStorage.getItem(`liked_posts_${currentUser.id}`)) || [];
        return likedPosts.includes(parseInt(postId));
    }

    // Переключение лайка
    async function toggleLike(postId, button) {
        const isLiked = button.textContent === '❤️';
        const method = isLiked ? 'DELETE' : 'POST';
        
        try {
            const response = await fetch(`http://localhost:8000/posts/${postId}/like`, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(currentUser)
            });

            if (response.ok) {
                button.textContent = isLiked ? '🤍' : '❤️';
                
                // список лайкнутых постов
                let likedPosts = JSON.parse(localStorage.getItem(`liked_posts_${currentUser.id}`)) || [];
                
                if (isLiked) {
                    likedPosts = likedPosts.filter(id => id !== parseInt(postId));
                } else {
                    likedPosts.push(parseInt(postId));
                }
                
                localStorage.setItem(`liked_posts_${currentUser.id}`, JSON.stringify(likedPosts));
                
                // счетчик лайков
                const likesCount = button.parentElement.querySelector('.likes-count');
                if (likesCount) {
                    const currentCount = parseInt(likesCount.textContent);
                    likesCount.textContent = isLiked ? currentCount - 1 : currentCount + 1;
                }
            } else {
                const error = await response.json();
                alert(error.detail || 'Ошибка при обработке лайка');
            }
        } catch (error) {
            console.error('Ошибка:', error);
            alert('Ошибка сети');
        }
    }
    
});
document.addEventListener('DOMContentLoaded', function() {
    const articlesContainer = document.getElementById('articles-container');
    const articleModal = document.getElementById('article-modal');
    const closeModal = document.querySelector('.close-modal');
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));

    // Загрузка всех постов
    async function loadPosts() {
        try {
            const response = await fetch('http://localhost:8000/posts/');
            if (!response.ok) throw new Error('Ошибка загрузки постов');
            
            const posts = await response.json();
            displayPosts(posts);
        } catch (error) {
            console.error('Ошибка:', error);
            articlesContainer.innerHTML = '<p class="error">Не удалось загрузить статьи</p>';
        }
    }

    // Отображение постов
    function displayPosts(posts) {
        if (!posts.length) {
            articlesContainer.innerHTML = '<p>Статей пока нет</p>';
            return;
        }

        articlesContainer.innerHTML = '';
        
        posts.forEach(post => {
            const articleCard = document.createElement('div');
            articleCard.className = 'article-card';
            
            const excerpt = post.content.length > 150 ? 
                post.content.substring(0, 150) + '...' : 
                post.content;
            
            articleCard.innerHTML = `
                <div class="article-content">
                    <h3 class="article-title">${post.title}</h3>
                    <p class="article-excerpt">${excerpt}</p>
                    <div class="article-meta">
                        <span class="article-author">${post.author_login || 'Неизвестный автор'}</span>
                        <span class="likes-count">❤️ ${post.likes_count || 0}</span>
                    </div>
                    <a href="#" class="read-article-btn" data-id="${post.id}">Читать полностью</a>
                    ${currentUser ? `<button class="like-button" data-id="${post.id}">${isPostLiked(post.id) ? '❤️' : '🤍'}</button>` : ''}
                </div>
            `;
            
            articlesContainer.appendChild(articleCard);
        });

        // Добавляем обработчики для кнопок "Читать полностью"
        document.querySelectorAll('.read-article-btn').forEach(btn => {
            btn.addEventListener('click', async function(e) {
                e.preventDefault();
                const postId = this.getAttribute('data-id');
                await showFullArticle(postId);
            });
        });

        // Добавляем обработчики для лайков
        if (currentUser) {
            document.querySelectorAll('.like-button').forEach(btn => {
                btn.addEventListener('click', async function() {
                    const postId = this.getAttribute('data-id');
                    await toggleLike(postId, this);
                });
            });
        }
    }

    // Проверка, лайкнут ли пост
    function isPostLiked(postId) {
        // В реальном приложении нужно получать эту информацию с сервера
        const likedPosts = JSON.parse(localStorage.getItem(`liked_posts_${currentUser?.id}`)) || [];
        return likedPosts.includes(parseInt(postId));
    }

    // Переключение лайка
    async function toggleLike(postId, button) {
        if (!currentUser) {
            alert('Только авторизованные пользователи могут ставить лайки');
            return;
        }

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
                // Обновляем состояние кнопки
                button.textContent = isLiked ? '🤍' : '❤️';
                
                // Обновляем список лайкнутых постов в localStorage
                let likedPosts = JSON.parse(localStorage.getItem(`liked_posts_${currentUser.id}`)) || [];
                
                if (isLiked) {
                    likedPosts = likedPosts.filter(id => id !== parseInt(postId));
                } else {
                    likedPosts.push(parseInt(postId));
                }
                
                localStorage.setItem(`liked_posts_${currentUser.id}`, JSON.stringify(likedPosts));
                
                // Обновляем счетчик лайков
                const likesCount = button.previousElementSibling.querySelector('.likes-count');
                if (likesCount) {
                    const currentCount = parseInt(likesCount.textContent.replace('❤️ ', ''));
                    likesCount.textContent = `❤️ ${isLiked ? currentCount - 1 : currentCount + 1}`;
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

    // Показать полную статью
    async function showFullArticle(postId) {
        try {
            const response = await fetch(`http://localhost:8000/posts/`);
            if (!response.ok) throw new Error('Ошибка загрузки статьи');
            
            const posts = await response.json();
            const post = posts.find(p => p.id == postId);
            
            if (post) {
                document.getElementById('full-article-title').textContent = post.title;
                document.getElementById('full-article-content').textContent = post.content;
                document.getElementById('full-article-meta').innerHTML = `
                    Автор: ${post.author_login || 'Неизвестный'} | 
                    Лайков: ${post.likes_count || 0} | 
                    ${new Date().toLocaleDateString('ru-RU')}
                `;
                
                articleModal.style.display = 'block';
            }
        } catch (error) {
            console.error('Ошибка:', error);
            alert('Не удалось загрузить статью');
        }
    }

    // Закрытие модального окна
    closeModal.addEventListener('click', function() {
        articleModal.style.display = 'none';
    });

    window.addEventListener('click', function(event) {
        if (event.target == articleModal) {
            articleModal.style.display = 'none';
        }
    });

    // Загружаем посты при загрузке страницы
    loadPosts();
});
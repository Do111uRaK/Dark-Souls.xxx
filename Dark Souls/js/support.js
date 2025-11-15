document.addEventListener('DOMContentLoaded', function() {
    const messageInput = document.getElementById('message');
    const submitBtn = document.getElementById('submitBtn');
    const resultDiv = document.getElementById('result');
    const processedText = document.getElementById('processedText');
    const charCount = document.getElementById('charCount');

    // Обработчик изменения текста для подсчета символов
    messageInput.addEventListener('input', function() {
        const count = this.value.length;
        charCount.textContent = count;
        
        if (count > 500) {
            this.value = this.value.substring(0, 500);
            charCount.textContent = 500;
        }
    });

    // Обработчик нажатия кнопки
    submitBtn.addEventListener('click', function() {
        const originalText = messageInput.value.trim();
        
        if (originalText === '') {
            alert('Пожалуйста, введите ваше сообщение!');
            return;
        }
        
        // Обработка текста
        let processed = originalText.toLowerCase();
        if (processed.length > 0) {
            processed = processed.charAt(0).toUpperCase() + processed.slice(1);
        }
        
        // Вывод результата
        processedText.textContent = processed;
        resultDiv.style.display = 'block';
        
        // Прокрутка к результату
        resultDiv.scrollIntoView({ behavior: 'smooth' });
    });
});
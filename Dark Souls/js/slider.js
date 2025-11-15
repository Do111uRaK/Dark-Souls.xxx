$(document).ready(function() {
    const $slider = $('#fade-slider');
    const $images = $slider.find('img');
    const $startBtn = $('#start-slider');
    const $stopBtn = $('#stop-slider');
    
    let currentIndex = 0;
    let nextIndex = 1;
    let slideInterval = null;
    const slideDuration = 3000; // 3 секунды
    
    // Инициализация - показываем первый слайд
    $images.eq(0).addClass('active');
    
    // Функция для перехода к следующему слайду
    function nextSlide() {
        const $current = $images.eq(currentIndex);
        const $next = $images.eq(nextIndex);
        
        // Плавное перекрытие
        $next.addClass('active');
        $current.removeClass('active');
        
        // Обновляем индексы
        currentIndex = nextIndex;
        nextIndex = (nextIndex + 1) % $images.length;
    }
    
    // Запуск слайд-шоу
    function startSlider() {
        if (slideInterval === null) {
            $startBtn.prop('disabled', true);
            $stopBtn.prop('disabled', false);
            
            // Сразу запускаем первый переход
            nextSlide();
            
            // Запускаем интервал
            slideInterval = setInterval(nextSlide, slideDuration);
        }
    }
    
    // Остановка слайд-шоу
    function stopSlider() {
        if (slideInterval !== null) {
            clearInterval(slideInterval);
            slideInterval = null;
            $startBtn.prop('disabled', false);
            $stopBtn.prop('disabled', true);
        }
    }
    
    // Обработчики событий
    $startBtn.on('click', startSlider);
    $stopBtn.on('click', stopSlider);
    
    // Автозапуск слайдера при загрузке (можно закомментировать)
    // startSlider();
});


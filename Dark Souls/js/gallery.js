// Задача 1: Коллекция изображений
const imageArray = [
    'images/ds1.jpg',
    'images/ds2.jpg',
    'images/ds3.jpg',
    'images/ds4.jpg'
];

const imageContainer = document.getElementById('image-container');

imageArray.forEach((imageSrc) => {
    const imgElement = document.createElement('img');
    imgElement.src = imageSrc;
    imgElement.alt = 'Dark Souls Image';
    imgElement.className = 'gallery-image';
    imageContainer.appendChild(imgElement);
});

// Задача 2: Замена при наведении
const hoverImage = document.getElementById('hover-image');

hoverImage.addEventListener('mouseover', () => {
    hoverImage.src = 'images/ds2.jpg';
});

hoverImage.addEventListener('mouseout', () => {
    hoverImage.src = 'images/ds1.jpg';
});

// Задача 3: Замена по кнопке
const clickImage = document.getElementById('click-image');
const changeBtn = document.getElementById('change-btn');

changeBtn.addEventListener('click', () => {
    clickImage.src = 'images/ds3.jpg';
});

// Задача 4: Циклическая замена
const cycleImage = document.getElementById('cycle-image');
const cycleBtn = document.getElementById('cycle-btn');
let currentImageIndex = 0;
const cycleImages = [
    'images/ds1.jpg',
    'images/ds2.jpg',
    'images/ds3.jpg',
    'images/ds4.jpg'
];

cycleBtn.addEventListener('click', () => {
    currentImageIndex = (currentImageIndex + 1) % cycleImages.length;
    cycleImage.src = cycleImages[currentImageIndex];
});

    let cycleInterval;

    // Элементы управления
    const intervalInput = document.getElementById('interval-input');
    const startButton = document.getElementById('start-cycle');
    const stopButton = document.getElementById('stop-cycle');
    const displayImage = document.getElementById('cycle-display');

    // Функция смены изображения
    function changeImage() {
        currentImageIndex = (currentImageIndex + 1) % cycleImages.length;
        displayImage.src = cycleImages[currentImageIndex];
    }

    // Запуск цикла
    startButton.addEventListener('click', function() {
        const interval = parseInt(intervalInput.value) || 2000;
        cycleInterval = setInterval(changeImage, interval);
        startButton.disabled = true;
        stopButton.disabled = false;
    });

    // Остановка цикла
    stopButton.addEventListener('click', function() {
        clearInterval(cycleInterval);
        startButton.disabled = false;
        stopButton.disabled = true;
    });
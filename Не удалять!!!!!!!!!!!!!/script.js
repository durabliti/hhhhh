/* ==================== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ==================== */
let scheduleData = [];
let lessonTimers = [];
const audio = new Audio('zvonok.mp3');

/* ==================== ЭЛЕМЕНТЫ ==================== */
const publicList = document.getElementById('public-list');
const editorSection = document.getElementById('editor-section');
const editorList = document.getElementById('editor-list');
const btnAddLesson = document.getElementById('btn-add-lesson');
const btnDownload = document.getElementById('btn-download-json');
const btnLogout = document.getElementById('btn-logout');
const adminBtn = document.getElementById('admin-login-btn');
const adminPassInput = document.getElementById('admin-pass');
const adminPopup = document.getElementById('admin-login-popup');
const adminError = document.getElementById('admin-error-msg');
const secretAdmin = document.getElementById('secret-admin');

const overlay = document.getElementById('overlay');
const lessonPopup = document.getElementById('lesson-popup');
const popupLessonName = document.getElementById('popup-lesson-name');
const popupTime = document.getElementById('popup-time');
const popupClose = document.getElementById('popup-close');

const animatedPopup = document.getElementById('animated-popup');
const animatedClose = document.getElementById('animated-close');
const animatedLessonName = document.getElementById('animated-lesson-name');
const animatedLessonDay = document.getElementById('animated-lesson-day');
const animatedLessonTime = document.getElementById('animated-lesson-time');

const blurBackground = document.getElementById('blur-background');

const inputNewDay = document.getElementById('new-day');
const inputNewStart = document.getElementById('new-start-time');
const inputNewEnd = document.getElementById('new-end-time');
const inputNewName = document.getElementById('new-lesson-name');

/* ==================== ЗАГРУЗКА РАСПИСАНИЯ ==================== */
async function loadSchedule() {
  try {
    // Если у тебя есть сервер:
    // const response = await fetch('/schedule');
    // scheduleData = await response.json();

    // Для локального файла JSON:
    scheduleData = JSON.parse(localStorage.getItem('schedule')) || [];

    renderSchedule();
    startTimers();
  } catch (err) {
    console.error('Ошибка загрузки расписания:', err);
  }
}

/* ==================== РЕНДЕР ==================== */
function renderSchedule() {
  publicList.innerHTML = '';
  editorList.innerHTML = '';

  scheduleData.forEach((lesson, index) => {
    const day = lesson.day || 'Понедельник';
    const name = lesson.name || 'Урок';
    const start = lesson.start || '00:00';
    const end = lesson.end || '00:00';

    // === Публичный список ===
    const liPublic = document.createElement('li');
    liPublic.textContent = `${day} | ${name} | ${start} - ${end}`;
    liPublic.addEventListener('click', () => showLessonPopup(lesson));
    publicList.appendChild(liPublic);

    // === Редактор ===
    const liEditor = document.createElement('li');

    const inputDay = document.createElement('input');
    inputDay.type = 'text';
    inputDay.value = day;

    const inputName = document.createElement('input');
    inputName.type = 'text';
    inputName.value = name;

    const inputStart = document.createElement('input');
    inputStart.type = 'time';
    inputStart.value = start;

    const inputEnd = document.createElement('input');
    inputEnd.type = 'time';
    inputEnd.value = end;

    const btnSave = document.createElement('button');
    btnSave.textContent = 'Сохранить';
    btnSave.classList.add('btn-save');
    btnSave.addEventListener('click', () => {
      scheduleData[index] = {
        day: inputDay.value,
        name: inputName.value,
        start: inputStart.value,
        end: inputEnd.value
      };
      saveSchedule();
      renderSchedule();
    });

    const btnDelete = document.createElement('button');
    btnDelete.textContent = 'Удалить';
    btnDelete.classList.add('btn-delete');
    btnDelete.addEventListener('click', () => {
      scheduleData.splice(index, 1);
      saveSchedule();
      renderSchedule();
    });

    liEditor.appendChild(inputDay);
    liEditor.appendChild(inputName);
    liEditor.appendChild(inputStart);
    liEditor.appendChild(inputEnd);
    liEditor.appendChild(btnSave);
    liEditor.appendChild(btnDelete);

    editorList.appendChild(liEditor);
  });
}

/* ==================== СОХРАНЕНИЕ РАСПИСАНИЯ ==================== */
function saveSchedule() {
  localStorage.setItem('schedule', JSON.stringify(scheduleData));
}

/* ==================== ДОБАВЛЕНИЕ УРОКА ==================== */
btnAddLesson.addEventListener('click', () => {
  const newLesson = {
    day: inputNewDay.value,
    name: inputNewName.value,
    start: inputNewStart.value,
    end: inputNewEnd.value
  };
  scheduleData.push(newLesson);
  saveSchedule();
  renderSchedule();
});

/* ==================== СКАЧАТЬ JSON ==================== */
btnDownload.addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(scheduleData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'schedule.json';
  a.click();
  URL.revokeObjectURL(url);
});

/* ==================== АДМИНКА ==================== */
let adminClickCount = 0;
secretAdmin.addEventListener('click', () => {
  adminClickCount++;
  if (adminClickCount >= 3) {
    adminPopup.classList.remove('hidden');
    adminPassInput.focus();
    adminClickCount = 0;
  }
});

document.getElementById('admin-close').addEventListener('click', () => {
  adminPopup.classList.add('hidden');
  adminPassInput.value = '';
  adminError.classList.add('hidden');
});

adminBtn.addEventListener('click', () => {
  const pass = adminPassInput.value;
  if (pass === '1234') {
    editorSection.classList.remove('hidden');
    adminPopup.classList.add('hidden');
    adminPassInput.value = '';
    adminError.classList.add('hidden');
  } else {
    adminError.classList.remove('hidden');
  }
});

btnLogout.addEventListener('click', () => {
  editorSection.classList.add('hidden');
});

/* ==================== ПОПАП УРОКА ==================== */
function showLessonPopup(lesson) {
  popupLessonName.textContent = lesson.name;
  popupTime.textContent = `${lesson.start} - ${lesson.end}`;
  overlay.classList.add('active');
}

popupClose.addEventListener('click', () => {
  overlay.classList.remove('active');
});

/* ==================== ПОПАП С АНИМАЦИЕЙ ==================== */
function showAnimatedLesson(lesson) {
  animatedLessonName.textContent = lesson.name;
  animatedLessonDay.textContent = lesson.day;
  animatedLessonTime.textContent = `${lesson.start} - ${lesson.end}`;
  animatedPopup.classList.add('show');
  blurBackground.classList.remove('hidden');
}

animatedClose.addEventListener('click', () => {
  animatedPopup.classList.remove('show');
  blurBackground.classList.add('hidden');
});

/* ==================== ТАЙМЕРЫ ==================== */
function startTimers() {
  clearTimers();
  const now = new Date();

  scheduleData.forEach((lesson) => {
    const startParts = (lesson.start || '00:00').split(':');
    const endParts = (lesson.end || '00:00').split(':');

    const startDate = new Date();
    startDate.setHours(parseInt(startParts[0]), parseInt(startParts[1]), 0, 0);

    const endDate = new Date();
    endDate.setHours(parseInt(endParts[0]), parseInt(endParts[1]), 0, 0);

    if (startDate > now) {
      const timerStart = setTimeout(() => {
        showAnimatedLesson(lesson);
        audio.play();
      }, startDate - now);
      lessonTimers.push(timerStart);
    }

    if (endDate > now) {
      const timerEnd = setTimeout(() => {
        animatedPopup.classList.remove('show');
        blurBackground.classList.add('hidden');
      }, endDate - now);
      lessonTimers.push(timerEnd);
    }
  });
}

function clearTimers() {
  lessonTimers.forEach(t => clearTimeout(t));
  lessonTimers = [];
}

/* ==================== ИНИЦИАЛИЗАЦИЯ ==================== */
loadSchedule();

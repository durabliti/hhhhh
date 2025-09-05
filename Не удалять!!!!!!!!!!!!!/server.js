const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

// ==================== MIDDLEWARE ====================
app.use(express.json());
app.use(express.static(__dirname)); // отдаём index.html, css, js и mp3

// ==================== РАСПИСАНИЕ ====================
const SCHEDULE_FILE = path.join(__dirname, "schedule.json");

// Получить расписание
app.get("/schedule.json", (req, res) => {
  fs.readFile(SCHEDULE_FILE, "utf8", (err, data) => {
    if (err) {
      console.error("Ошибка чтения schedule.json:", err);
      return res.status(500).json({ error: "Не удалось прочитать расписание" });
    }
    res.setHeader("Content-Type", "application/json");
    res.send(data);
  });
});

// Сохранить расписание
app.post("/save-schedule", (req, res) => {
  const newSchedule = req.body;
  fs.writeFile(SCHEDULE_FILE, JSON.stringify(newSchedule, null, 2), "utf8", (err) => {
    if (err) {
      console.error("Ошибка сохранения schedule.json:", err);
      return res.status(500).json({ error: "Не удалось сохранить расписание" });
    }
    res.json({ success: true });
  });
});

// ==================== ЗАПУСК СЕРВЕРА ====================
app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});

function updateClock() {
  const now = new Date();
  document.getElementById('clock').innerText = now.toLocaleTimeString();
}
setInterval(updateClock, 1000);

document.getElementById('date').innerText = new Date().toDateString();

navigator.geolocation.getCurrentPosition(async position => {
  const lat = position.coords.latitude;
  const lon = position.coords.longitude;

  const response = await fetch(`https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lon}&method=2`);
  const data = await response.json();
  const timings = data.data.timings;
  const container = document.getElementById('prayer-times');

  const requiredPrayers = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];
  const cardColors = ["primary", "success", "info", "warning", "danger"];

  requiredPrayers.forEach((name, index) => {
    const time = timings[name];
    const cardColor = cardColors[index % cardColors.length];
    const col = document.createElement('div');
    col.innerHTML = `
      <div class="card text-white bg-${cardColor} text-center h-100 shadow">
        <div class="card-body">
          <h5 class="card-title">${name}</h5>
          <p class="card-text fs-4">${time}</p>
        </div>
      </div>
    `;
    container.appendChild(col);
    setPrayerAlert(name, time);
  });
});

const azanAudio = new Audio("audio/azan.mp3");

function playAzan() {
  azanAudio.play().catch(err => console.log("Audio play error:", err));
}

function setPrayerAlert(name, time) {
  const [hour, minute] = time.split(':').map(Number);
  const alertTime = new Date();
  alertTime.setHours(hour);
  alertTime.setMinutes(minute - 5);
  alertTime.setSeconds(0);

  const now = new Date();
  const delay = alertTime - now;
  if (delay > 0) {
    setTimeout(() => {
      if (Notification.permission === "granted") {
        new Notification(`🕌 Reminder: ${name} prayer in 5 mins`);
        playAzan();
      }
    }, delay);
  }
}

if (Notification.permission !== "granted") {
  Notification.requestPermission();
}

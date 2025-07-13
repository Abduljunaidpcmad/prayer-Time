function updateClock() {
  const now = new Date();
  document.getElementById('clock').innerText = now.toLocaleTimeString();
}
setInterval(updateClock, 1000);

document.getElementById('date').innerText = new Date().toDateString();

const azanAudio = new Audio("audio/azan.mp3");
let audioEnabled = true;

// Toggle Button
const toggleBtn = document.getElementById("toggleAudio");
toggleBtn.addEventListener("click", () => {
  audioEnabled = !audioEnabled;
  toggleBtn.innerHTML = audioEnabled ? "🔊 Azan Sound: ON" : "🔇 Azan Sound: OFF";
  toggleBtn.classList.toggle("btn-outline-success", audioEnabled);
  toggleBtn.classList.toggle("btn-outline-danger", !audioEnabled);
});

function playAzan() {
  if (audioEnabled) {
    azanAudio.play().catch(err => console.log("Audio play error:", err));
  }
}

function renderPrayerTimes(timings) {
  const container = document.getElementById('prayer-times');
  container.innerHTML = "";

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

function fetchAndCachePrayerTimes(lat, lon) {
  fetch(`https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lon}&method=2`)
    .then(response => response.json())
    .then(data => {
      const timings = data.data.timings;
      localStorage.setItem("cachedPrayerTimes", JSON.stringify(timings));
      renderPrayerTimes(timings);
    })
    .catch(() => {
      const cached = localStorage.getItem("cachedPrayerTimes");
      if (cached) {
        renderPrayerTimes(JSON.parse(cached));
      } else {
        alert("You're offline and no cached data found.");
      }
    });
}

if (Notification.permission !== "granted") {
  Notification.requestPermission();
}

navigator.geolocation.getCurrentPosition(pos => {
  const lat = pos.coords.latitude;
  const lon = pos.coords.longitude;
  fetchAndCachePrayerTimes(lat, lon);
}, () => {
  const cached = localStorage.getItem("cachedPrayerTimes");
  if (cached) {
    renderPrayerTimes(JSON.parse(cached));
  } else {
    alert("Location denied and no cached data available.");
  }
});

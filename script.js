// Show Real-time Clock
function updateClock() {
  const now = new Date();
  document.getElementById('clock').innerText = now.toLocaleTimeString();
}
setInterval(updateClock, 1000);

// Show Today’s Date
document.getElementById('date').innerText = new Date().toDateString();

// Get Location and Fetch Prayer Times
navigator.geolocation.getCurrentPosition(async position => {
  const lat = position.coords.latitude;
  const lon = position.coords.longitude;

  const response = await fetch(`https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lon}&method=2`);
  const data = await response.json();
  const timings = data.data.timings;
  const container = document.getElementById('prayer-times');

  Object.entries(timings).forEach(([name, time]) => {
    const col = document.createElement('div');
    col.className = "col-md-4 time-card";
    col.innerHTML = `
      <div class="card text-center shadow">
        <div class="card-body">
          <h5 class="card-title">${name}</h5>
          <p class="card-text">${time}</p>
        </div>
      </div>
    `;
    container.appendChild(col);
    setPrayerAlert(name, time);
  });
});

// Notification Alert 5 minutes before prayer
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
      }
    }, delay);
  }
}

// Ask permission for notifications
if (Notification.permission !== "granted") {
  Notification.requestPermission();
}

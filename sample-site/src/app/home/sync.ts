const hour = new Date().getHours()
document.documentElement.dataset.daytime = hour >= 6 && hour < 18 ? "day" : "night"

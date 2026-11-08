const themes: Record<string, string> = { day: "thème · beige", night: "thème · café" }
const theme = localStorage.getItem("theme") === "night" ? "night" : "day"
document.documentElement.dataset.theme = theme
document.documentElement.dataset.themeName = themes[theme]

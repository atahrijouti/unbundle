const root = document.documentElement
const button = document.createElement("button")
button.textContent = root.dataset.themeName ?? ""
button.addEventListener("click", () => {
  localStorage.setItem("theme", root.dataset.theme === "night" ? "day" : "night")
  location.reload()
})
document.querySelector("nav")?.append(button)

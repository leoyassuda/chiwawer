const app = new Vue({
  el: "#app",
  data: {
    url: "",
    alias: "",
    error: "",
    formVisible: true,
    created: null,
  },
  methods: {
    async createUrl() {
      this.error = "";
      console.log(this.url, this.alias);
      const response = await fetch("/url", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          url: this.url,
          alias: this.alias || undefined,
        }),
      });
      if (response.ok) {
        const result = await response.json();
        this.formVisible = false;
        this.created = `https://shortner-url.vercel.app/${result.slug}`;
      } else if (response.status === 429) {
        this.error =
          "You are sending too many requests. Try again in 30 seconds.";
      } else {
        const result = await response.json();
        this.error = result.message;
      }
    },
  },
});

//Init tooltips
tippy("#buttonTheme", {
  placement: "bottom",
});

//Toggle mode
const toggle = document.querySelector(".js-change-theme");
const input = document.querySelector("input");
const form = document.querySelector("form");

toggle.addEventListener("click", () => {
  if (form.classList.contains("bg-white")) {
    toggle.innerHTML = "☀️";
    input.classList.remove("text-gray-900");
    input.classList.add("text-gray-400");
    form.classList.remove("bg-white");
    form.classList.add("bg-gray-800");
  } else {
    toggle.innerHTML = "🌙";
    input.classList.remove("text-gray-400");
    input.classList.add("text-gray-900");
    form.classList.remove("bg-gray-800");
    form.classList.add("bg-white");
  }
});

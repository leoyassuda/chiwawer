const routes = [
  {
    path: '/about', redirect: to => {
      console.log('>>>>>>>>>route about');
      window.location.href = 'https://www.leoyas.com';
    }
  },
  // {
  //   path: '/aliasNotFound',
  //   props: {
  //     url: '',
  //     alias: '',
  //     error: 'zzzzzzzzzzzzzzzzzz',
  //     formVisible: true,
  //     created: null,
  //   }
  // },
  {
    path: '/:alias', redirect: to => {
      console.log('alias-to', to);
      const redirectUrl = window.location.protocol + '//' + window.location.host + `/api/alias/${to.params.alias}`
      console.log('href', redirectUrl);
      window.location.href = redirectUrl;
    }
  },
]

const router = new VueRouter({
  routes
});

const app = new Vue({
  router,
  data: {
    url: '',
    alias: '',
    error: '',
    formVisible: true,
    created: null,
  },
  methods: {
    createUrl: async function () {
      this.error = '';
      console.log('Create URL:', this.data);
      const response = await fetch('/api/urls', {
        method: 'POST',
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          url: this.url,
          alias: this.alias || undefined,
        }),
      });
      console.log('post response:', response);
      if (response.ok) {
        const result = await response.json();
        // const href = document.location.href;
        this.formVisible = false;
        // this.created = `${href}${result.alias}`;
      } else if (response.status === 429) {
        this.error =
          'You are sending too many requests. Try again in 30 seconds.';
      } else {
        const result = await response.json();
        this.error = result.message;
      }
    },
  }
}).$mount('#app');

//Init tooltips
tippy("#buttonTheme", {
  placement: "bottom",
});

//Toggle mode
const toggle = document.querySelector(".js-change-theme");
const title = document.getElementById("title");
const copyright = document.getElementById("copyright");
const input = document.querySelector("input");
const form = document.querySelector("form");

toggle.addEventListener("click", () => {
  if (form.classList.contains("bg-white")) {
    toggle.innerHTML = "☀️";
    input.classList.remove("text-gray-900");
    input.classList.add("text-gray-400");
    form.classList.remove("bg-white");
    form.classList.add("bg-gray-800");
    title.classList.remove("text-gray-900");
    title.classList.add("text-gray-100");
    copyright.classList.remove("text-gray-900");
    copyright.classList.add("text-gray-100");
  } else {
    toggle.innerHTML = "🌙";
    input.classList.remove("text-gray-400");
    input.classList.add("text-gray-900");
    form.classList.remove("bg-gray-800");
    form.classList.add("bg-white");
    title.classList.remove("text-gray-100");
    title.classList.add("text-gray-900");
    copyright.classList.remove("text-gray-100");
    copyright.classList.add("text-gray-900");
  }
});

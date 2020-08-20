# Chiwawer - Shortner URL

A simple shortner URL

---

## Cloning the repo

```
git clone https://github.com/leoyassuda/chiwawer.git
```

## Setup

```
cd chiwawer/server
npm install
```

## Development

```
npm run dev
```

---

### Navigation

> / = home with form to create shortner URLs
>
> /{id} = (GET) return a json with attributes URL and alias.

---

### Includes API Server utilities:

- [morgan](https://www.npmjs.com/package/morgan)
  - HTTP request logger middleware for node.js
- [dotenv](https://www.npmjs.com/package/dotenv)
  - Dotenv is a zero-dependency module that loads environment variables from a `.env` file into `process.env`
- [rate-limit](https://www.npmjs.com/package/express-rate-limit)
  - Use to limit repeated requests to public APIs and/or endpoints such as password reset.
- [slow-down](https://www.npmjs.com/package/express-slow-down)
  - Slows down responses rather than blocking them outright

### Development utilities:

- [nodemon](https://www.npmjs.com/package/nodemon)
  - nodemon is a tool that helps develop node.js based applications by automatically restarting the node application when file changes in the directory are detected.
- [eslint](https://www.npmjs.com/package/eslint)
  - ESLint is a tool for identifying and reporting on patterns found in ECMAScript/JavaScript code.

---

## Authors

- **Leo Yassuda** - _Initial work_ - [Chiwawer-Shortner-Urls](https://github.com/leoyassuda/chiwawer)

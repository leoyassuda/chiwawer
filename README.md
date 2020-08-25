# Chiwawer - Shortner URL

A simple shortner URL using mongoDB and VueJS

<br/>

## Cloning the repo

```
git clone https://github.com/leoyassuda/chiwawer.git
```

## Setup

```
cd chiwawer
npm install
npm i -g vercel
```

### MongoDB connection

This project is based on Atlas to get easier to develop and a free account works for this project.

> create a `.env` file in root of project
>
> in `.env` you need to add a environment key `MONGO_URI` and the value is the mongodb connection URI.
>
> Access mongo atlas account, in the Cluster section, you can find the connection info:
>
> ![mongodb connection page info](https://dev-to-uploads.s3.amazonaws.com/i/spq87e95v0abgndh4nj1.png "Info mongodb connection")
>
> select **"Connect your application"**, after that you can find the URI connection.

## Development

to run local

```
vercel dev
```

---

### Navigation

> / = home with form to create shortner URLs
>
> /{alias} = (GET) redirect to API /api/alias/{alias}.
>
> /api/alias/{alias} = (GET) find one url and use it to redirect.
>
> /api/urls/ = (POST) create a new URL

---

### Includes API Server utilities:

- [pino-logflare](https://www.npmjs.com/package/pino-logflare)

  - HTTP request logger middleware for node.js and transport for log from vercel to logflare account.

- [mongodb](https://www.npmjs.com/package/mongodb)
  - The official MongoDB driver for Node.js. Provides a high-level API on top of mongodb-core that is meant for end users.
- [monk](https://www.npmjs.com/package/monk)
  - A tiny layer that provides simple yet substantial usability improvements for MongoDB usage within Node.JS.

### Development utilities:

- [vercel](https://www.npmjs.com/package/vercel)
  - Vercel is the optimal workflow for frontend teams. All-in-one: Static and Jamstack deployment, Serverless Functions, and Global CDN.
- [dotenv](https://www.npmjs.com/package/dotenv)
  - Dotenv is a zero-dependency module that loads environment variables from a `.env` file into `process.env`

---

## Authors

- **Leo Yassuda** - _Initial work_ - [Chiwawer-Shortner-Urls](https://github.com/leoyassuda/chiwawer)

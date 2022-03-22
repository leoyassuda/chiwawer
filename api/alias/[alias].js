// Import Dependencies
const pino = require('pino');
const logger = pino({
    transport: {
        target: 'pino-pretty',
        options: {
            colorize: true,
        },
    },
});
const url = require('url');
const MongoClient = require('mongodb').MongoClient;

// Create cached connection variable
let cachedDb = null;

async function connectToDatabase(uri) {
    // If the database connection is cached,
    // use it instead of creating a new connection
    if (cachedDb) {
        logger.info({
            db: {
                message: 'Using cacheDb',
                location: 'api/alias/[alias].js',
                method: 'connectToDatabase',
                data: cachedDb,
            },
            event: {
                type: 'request',
                tag: 'db',
            },
        });
        return cachedDb;
    }

    // If no connection is cached, create a new one
    const client = await MongoClient.connect(uri, {
        useUnifiedTopology: true,
        useNewUrlParser: true,
    });

    // const db = await client.db(uri);
    const db = await client.db(url.parse(uri).pathname.substr(1));

    // Cache the database connection and return the connection
    cachedDb = db;
    return db;
}

export default async function handler(req, res) {
    const { body } = req;

    const alias = req.query.alias;
    const query = {
        alias: alias,
    };

    logger.info({
        db: {
            message: 'Requesing alias redirect',
            location: 'api/alias/[alias].js',
            method: 'req.redirect',
            data: query,
        },
        event: {
            type: 'request',
            tag: 'app',
        },
    });

    const db = await connectToDatabase(process.env.MONGO_URI);

    const collection = await db.collection('urls');

    const urlResult = await collection.findOne(query);

    if (urlResult) {
        logger.info({
            db: {
                message: 'Find one by alias',
                location: 'api/alias/[alias].js',
                method: 'findOne',
                query: query,
                data: urlResult,
            },
            event: {
                type: 'request',
                tag: 'db',
            },
        });

        res.setHeader('Cache-Control', 's-maxage=3600');
        return res.status(200).redirect(urlResult.url);
    } else {
        logger.info({
            db: {
                message: 'cache',
                location: 'api/alias/[alias].js',
                method: 'findOne',
                data: urlResult,
            },
            event: {
                type: 'request',
                tag: 'db',
            },
        });
    }

    const proto =
        req.headers['x-forwarded-proto'] + req.headers['x-forwarded-port'];
    const host =
        req.headers['x-vercel-deployment-url'] +
        '/#/aliasNotFound?aliasError=' +
        query.alias;

    res.setHeader('Cache-Control', 's-maxage=3600');
    res.status(200).redirect(proto + host);
}

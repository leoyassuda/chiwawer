import AppError from './exceptions/AppError';
const pino = require('pino');
const logger = pino({
    transport: {
        target: 'pino-pretty',
        options: {
            colorize: true,
        },
    },
});
const yup = require('yup');
const monk = require('monk');
const { nanoid } = require('nanoid');

require('dotenv').config();

const db = monk(process.env.MONGO_URI);
const urls = db.get('urls');

db.then(() => {
    logger.info({
        db: {
            message: 'Connected correctly to server',
            location: 'api/urls/index.js',
            method: 'db.callback.connection',
        },
        event: {
            type: 'request',
            tag: 'db',
        },
    });
});

urls.createIndex(
    {
        alias: 1,
    },
    {
        unique: true,
    },
);

const schema = yup.object().shape({
    alias: yup
        .string()
        .trim()
        .matches(/^[\w\-]+$/i),
    url: yup.string().trim().url().required(),
});

module.exports = async (req, res) => {
    let { alias, url } = req.body;

    try {
        await schema.validate({
            alias,
            url,
        });
        if (
            url.includes('chiwawer.vercel.app') ||
            url.includes('tinyly.link')
        ) {
            throw new Error('Stop it. 🛑🙅‍♀️');
        }
        if (!alias) {
            alias = nanoid(5);
        } else {
            const existing = await urls.findOne({
                alias,
            });
            if (existing) {
                throw new AppError('Alias already in use! 🤷‍♀️', 409);
            }
        }
        alias = alias.toLowerCase();
        const newUrl = {
            url,
            alias,
        };
        const created = await urls.insert(newUrl);

        logger.info({
            db: {
                message: 'Created url',
                location: 'api/urls/index.js',
                method: 'db.urls.insert',
            },
            event: {
                type: 'request',
                tag: 'db',
            },
        });

        res.json(created);
    } catch (err) {
        logger.error({
            api: {
                message: 'Error to create url',
                location: 'api/urls/index.js',
                method: 'db.urls.insert',
                stack: err.message,
            },
            event: {
                type: 'request',
                tag: 'db',
            },
        });

        if (err instanceof AppError) {
            return res.status(409).send({
                message: 'Alias already exists, please create a new one 🧐',
                error: err.message,
            });
        }

        return res.status(500).send({
            message: 'Something is wrong to create a url',
            error: err.message,
        });
    }
};

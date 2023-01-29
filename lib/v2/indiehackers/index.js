const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const cheerio = require('cheerio');
const logger = require('../../utils/logger');

module.exports = async (ctx) => {
    const baseUrl = `https://www.indiehackers.com`;
    const { data } = await got(baseUrl);

    const $ = cheerio.load(data);

    const items = $('.community__posts-section .feed-item').toArray().map((item) => {
        const item2 = $(item);

        const title = item2.find('a.feed-item__title-link').text();
        const href = item2.find('a.feed-item__title-link').attr('href');
        const author = item2.find('span.user-link__name').text();


        const link = `${baseUrl}${href}`;
        logger.info(`href ${href} title ${title} author ${author}`);

        return {
            title,
            link,
            author
        };
    });

    //
    // const items = data.map((item) => ({
    //     title: `${item.title} 🌟 ${item.source.likesCount}`,
    //     author: item.source.username,
    //     pubDate: parseDate(item.source.createdAt),
    //     link: item.source.targetUrl,
    //     description: item.description,
    // }));

    ctx.state.data = {
        title: 'indiehackers',
        link: 'https://www.indiehackers.com/',
        item: items,
    };
};

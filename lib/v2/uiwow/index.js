const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const cheerio = require('cheerio');
const logger = require('../../utils/logger');

module.exports = async (ctx) => {
    const forumId = ctx.params.forumId;

    const domain = 'https://uiwow.com/';
    const baseUrl = `https://uiwow.com/forum-${forumId}-1.html`;
    const { data } = await got(baseUrl);

    const $ = cheerio.load(data);

    let itemsWithoutDetail = $('table#threadlisttableid tbody').toArray().map((item) => {
        const item2 = $(item);

        const title = item2.find('a.cony_listzt_topbt').text();
        const href = item2.find('a.cony_listzt_topbt').attr('href');
        const author = item2.find('li.z a[style=\'text-decoration: none;\']').text();
        // const pubDate = parseDate(item2.find('li.z a[style=\'text-decoration: none;color: #9E9E9E;\'] span').attr('title'));


        const link = `${domain}/${href}`;
        logger.info(`href ${href} title ${title} author ${author}`);

        return {
            title,
            link,
            author
        };
    });

    logger.info('filrer start');
    itemsWithoutDetail = itemsWithoutDetail.filter((e) => e.link && !e.link.includes('undefined'));
    logger.info('filrer end');

    const items = await Promise.all(
        itemsWithoutDetail.map((i) =>
            ctx.cache.tryGet(i.link, async () => {
                logger.info(`tryGet start ${i.link}`);

                const browser = await require('@/utils/puppeteer')();
                const page = await browser.newPage();
                await page.goto(i.link);

                const html = await page.evaluate(
                    () =>
                        // 选取渲染后的 HTML
                        document.querySelector('html').innerHTML
                );

                // const detailResponse = await got({
                //     method: 'get',
                //     headers: {
                //         'User-Agent': UA
                //     },
                //     url: i.link,
                // });
                browser.close();


                logger.info(`tryGet ${i.link}`);


                const content = cheerio.load(html);

                i.description = $(content('div.pcb').toArray()[0]).html();
                logger.info(`content('.authi em').text() ${content('.authi em').text()}`);
                i.pubDate = parseDate($(content('.authi em').toArray()[0]).text().replace("发表于", ""));
                return i;
            }))
    );


    //
    // const items = data.map((item) => ({
    //     title: `${item.title} 🌟 ${item.source.likesCount}`,
    //     author: item.source.username,
    //     pubDate: parseDate(item.source.createdAt),
    //     link: item.source.targetUrl,
    //     description: item.description,
    // }));

    ctx.state.data = {
        title: '有爱魔兽世界论坛',
        link: 'https://uiwow.com/',
        item: items,
    };
};

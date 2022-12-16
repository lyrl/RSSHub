const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');

const rootUrl = 'https://tw.forums.blizzard.com';

module.exports = async (ctx) => {
    const {data} = await got.get("https://tw.forums.blizzard.com/zh/wow/groups/blizzard-tracker/posts.json");


    const items = data.map((item) => ({
        title: item.title,
        author: item.user.username,
        pubDate: parseDate(item.created_at),
        link: "https://tw.forums.blizzard.com/zh/wow" + item.url,
        description: item.excerpt,
    }));

    ctx.state.data = {
        title: `Blizzard - TaiWan`,
        link: rootUrl,
        item: items,
    };
};

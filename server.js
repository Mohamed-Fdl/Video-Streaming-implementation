const Koa = require('koa');
const { extname } = require('path')
const { createReadStream, stat } = require('fs')
const { promisify } = require('util')
const app = new Koa();

app.use(async({ request, response }, next) => {
    if (!request.url.startsWith('/api/video') || !request.query.video || !request.query.video.match(/^[a-z0-9-_ ]+\.(mp4|mov)$/i)) {
        return next()
    }
    const video = request.query.video
    const range = request.header.range
    if (!range) {
        return next()
    }
    const parts = range.replace('bytes=', '').split('-')
    const videoStat = await promisify(stat)('./videos/' + video)
    const start = parseInt(parts[0], 10)
    const end = parts[1] ? parseInt(parts[1], 10) : videoStat.size - 1
    response.set('Content-Length', end - start + 1)
    response.set('Content-Range', `bytes ${start}-${end}/${videoStat.size}`)
    response.set('Accept-Range', 'bytes')
    response.status = 206
    response.body = createReadStream('./videos/' + video, { start, end })


})

app.on('error', () => {

})

app.listen(8000);
import fetch from './fetch.js';
import jsdom from 'jsdom';
const { JSDOM } = jsdom;
import fs, { link } from 'fs';
import path from 'path';

import { fileURLToPath } from "url";
// const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DATE = '20220925';
console.log('当前获取的日期:', DATE);
const SAVE_PATH = path.join(__dirname, 'news', DATE + '.md');
console.log('保存新闻文件的地址:', SAVE_PATH);
const CATALOGUE_PATH = path.join(__dirname, 'README.md');
console.log('目录文件地址:', CATALOGUE_PATH);

const getNewsList = async date => {
	const HTML = await fetch(`http://tv.cctv.com/lm/xwlb/day/${date}.shtml`);
	const fullHTML = `<!DOCTYPE html><html><head></head><body>${HTML}</body></html>`;
	const dom = new JSDOM(fullHTML);
	const nodes = dom.window.document.querySelectorAll('a');
	var links = [];
	nodes.forEach(node => {
		// 从dom节点获得href中的链接
		let link = node.href;
		// 如果已经有了就不再添加 (去重)
		if (!links.includes(link)) links.push(link);
	});
	const abstract = links[0];
	links.shift();
	console.log('成功获取新闻列表');
	return {
		abstract,
		news: links
	}
}

const getAbstract = async link => {
	const HTML = await fetch(link);
	const dom = new JSDOM(HTML);
	const abstract = dom.window.document.querySelector(
		'#page_body > div.allcontent > div.video18847 > div.playingCon > div.nrjianjie_shadow > div > ul > li:nth-child(1) > p'
	).innerHTML.replaceAll('； ', "\n\n");
	console.log('成功获取新闻简介');
	return abstract;
}

const getNews = async links => {
	const linksLength = links.length;
	console.log('共', linksLength, '则新闻, 开始获取');
	// 所有新闻
	var news = [];
	for (let i = 0; i < linksLength; i++) {
		const url = links[i];
		const html = await fetch(url);
		const dom = new JSDOM(html);
		const title = dom.window.document.querySelector('#page_body > div.allcontent > div.video18847 > div.playingVideo > div.tit').innerHTML.replace('[视频]', '');
		const content = dom.window.document.querySelector('#content_area').innerHTML;
		news.push({ title, content });
		console.count('获取的新闻则数');
	}
	console.log('成功获取所有新闻');
	return news;
}

const newsToMarkdown = ({ date, abstract, news, links }) => {
	// 将数据处理为md文档
	let mdNews = '';
	const newsLength = news.length;
	for (let i = 0; i < newsLength; i++) {
		const { title, content } = news[i];
		const link = links[i];
		mdNews += `### ${title}\n\n${content}\n\n[查看原文](${link})\n\n`;
	}
	return `# 新闻联播 (${date})\n\n## 新闻摘要\n\n${abstract}\n\n## 详细新闻\n\n${mdNews}\n\n---\n\n(更新时间戳: ${new Date().getTime()})\n\n`;
}

const saveTextToFile = (savePath, text) => {
	// 输出到文件
	fs.writeFile(savePath, text, {}, (err) => {
		if (err) {
			console.error('输出文档错误', err);
		} else {
			console.log('保存成功, 文件地址为', savePath);
		}
	});
}

const updateCatalogue = (path, date) => {
	fs.readFile(path, {}, (err, data) => {
		if (err) {
			console.error('更新目录失败 (读取)', err);
			return false;
		}
		data = data.toString();
		const text = data.replace('<!-- INSERT -->', `<!-- INSERT -->\n- [${date}](./news/${date}.md)`)
		fs.writeFile(path, text, {}, (err) => {
			if (err) {
				console.error('更新目录失败 (写入)', err);
			} else {
				console.log('更新目录成功');
			}
		});
	});
}

const newsList = await getNewsList(DATE);
const abstract = await getAbstract(newsList.abstract);
const news = await getNews(newsList.news);
const md = newsToMarkdown({
	date: DATE,
	abstract,
	news,
	links: newsList.news
});
saveTextToFile(SAVE_PATH, md);
updateCatalogue(CATALOGUE_PATH, DATE);
console.log('全部成功, 程序结束');
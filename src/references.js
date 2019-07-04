const url = require('url');
const { red, inverse } = require('kleur');
const commander = require('commander');

if (!commander.args[0]) {
	console.log(`\n${inverse(red(' Error '))} Missing course URL`);
	process.exit();
} else if (!commander.args[0].match(/(?:^https:\/\/)(.+)(?:\.udemy\.com\/.+)/i)) {
	console.log(`\n${inverse(red(' Error '))} Course URL is not valid`);
	process.exit();
}

let sub_domain = url.parse(commander.args[0].toLowerCase())['hostname'].match(/(^.+)(?:\.udemy\.com)/);

if (!sub_domain) {
	console.log(`\n${inverse(red(' Error '))} Course URL is not valid`);
	process.exit();
}

sub_domain = sub_domain[1];

const headers = {
	'Origin': 'www.udemy.com',
	'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:67.0) Gecko/20100101 Firefox/67.0',
	'Accept': '*/*',
	'Accept-Language': 'en-US,en;q=0.5',
	'Referer': 'https://www.udemy.com/join/login-popup/',
	'Connection': 'keep-alive'
};

const login_url =
	'https://www.udemy.com/join/login-popup/?displayType=ajax&display_type=popup&showSkipButton=1&returnUrlAfterLogin=https';

const search_url = `https://${sub_domain}.udemy.com/api-2.0/users/me/subscribed-courses?fields%5Bcourse%5D=%40min&page=1&page_size=5&search=`;

const draft_course_search_url = `https://${sub_domain}.udemy.com/api-2.0/users/me/enrollments/`;

module.exports = {
	headers,
	login_url,
	search_url,
	draft_course_search_url,
	sub_domain
};

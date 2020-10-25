const url = require('url');
const {red, inverse} = require('kleur');
const commander = require('commander');

if (!commander.args[0]) {
	console.log(`\n${inverse(red(' Error '))} Missing course URL`);
	process.exit();
} else if (!commander.args[0].match(/^ht{2}ps:\/{2}(.+)\.udemy\.com\/.+/i)) {
	console.log(`\n${inverse(red(' Error '))} Course URL is not valid`);
	process.exit();
}

let sub_domain = new url.URL(commander.args[0].toLowerCase())['hostname'].match(/(^.+)\.udemy\.com/);

if (!sub_domain) {
	console.log(`\n${inverse(red(' Error '))} Course URL is not valid`);
	process.exit();
}

sub_domain = sub_domain[1];

const headers = {
	'x-udemy-client-secret': 'a7c630646308824b2301fdb60ecfd8a0947e82d5',
	authorization: 'Basic YWQxMmVjYTljYmUxN2FmYWM2MjU5ZmU1ZDk4NDcxYTY6YTdjNjMwNjQ2MzA4ODI0YjIzMDFmZGI2MGVjZmQ4YTA5NDdlODJkNQ==',
	'accept-encoding': 'gzip',
	'accept-language': 'en_US',
	'user-agent': 'Android UdemyAndroid (phone)'
};

const login_url =
	'https://www.udemy.com/api-2.0/auth/udemy-auth/login/?fields[user]=title,image_100x100,is_fraudster,num_subscribed_courses,name,initials,has_instructor_intent,permissions,num_published_courses,access_token';

const search_url = `https://${sub_domain}.udemy.com/api-2.0/users/me/subscribed-courses?fields%5Bcourse%5D=%40min&page=1&page_size=5&search=`;

const draft_course_search_url = `https://${sub_domain}.udemy.com/api-2.0/users/me/enrollments/`;

module.exports = {
	headers,
	login_url,
	search_url,
	draft_course_search_url,
	sub_domain
};

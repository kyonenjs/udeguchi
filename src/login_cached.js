const commander = require('commander');
const {find_owned_course} = require('./search');
const {extract_course_name, load_cached_cookie_file, green_bg} = require('./utilities.js');
const {login_with_cookie, login_with_username_password} = require('./login_methods.js');

const use_cached_cookie = async (username, password) => {
	const data = load_cached_cookie_file();
	const course_url = commander.args[0];

	const account_index = data.findIndex(account => account.username === username.toLowerCase());

	if (account_index === -1) {
		const auth_headers = await login_with_username_password(username, password);
		find_owned_course(extract_course_name(course_url), auth_headers);
	} else {
		process.stdout.write(`\n${green_bg('Using cached cookie')}`);
		commander.username = username;
		commander.password = password;
		const auth_headers = login_with_cookie(undefined, data[account_index].access_token);
		find_owned_course(extract_course_name(course_url), auth_headers);
	}
};

module.exports = {
	use_cached_cookie
};

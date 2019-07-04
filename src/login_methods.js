const fs = require('fs');
const { green, inverse } = require('kleur');
const {
	handle_error,
	get_request,
	post_request,
	find_access_token,
	polish_cookies,
	create_auth_headers,
	create_cached_cookie
} = require('./utilities.js');
const { headers, login_url } = require('./references.js');

const login_with_username_password = async (username, password) => {
	console.log(`\n\n${green(inverse(' Logging with username and password '))}\n`);

	try {
		const get_data = await get_request(login_url, headers);

		const csrf_token = get_data['body'].match(/(?:csrfmiddlewaretoken(?:['"]) value=(?:['"]))(\w{64})/)[1];
		const post_body = {
			'email': username,
			'password': password,
			'csrfmiddlewaretoken': csrf_token
		};
		const post_cookie = polish_cookies(get_data['headers']['set-cookie']);

		const post_data = await post_request(login_url, post_body, post_cookie);

		const access_token = find_access_token(polish_cookies(post_data['headers']['set-cookie']));

		create_cached_cookie(access_token, username.toLowerCase());

		return create_auth_headers(access_token);
	} catch (error) {
		handle_error(error['message']);
	}
};

const login_with_cookie = (cookie_file_name, cached_token) => {
	try {
		let access_token;
		if (cached_token) {
			access_token = cached_token;
		} else {
			console.log(`\n${green(inverse(' Logging with cookie '))}`);
			const data = fs.readFileSync(cookie_file_name).toString();
			access_token = find_access_token(data);
		}

		if (access_token) {
			return create_auth_headers(access_token);
		}

		handle_error('Cookie is not valid');
	} catch (error) {
		if (error.code === 'ENOENT') {
			handle_error('File does not exist');
		} else {
			handle_error(error['message']);
		}
	}
};

module.exports = {
	login_with_username_password,
	login_with_cookie
};

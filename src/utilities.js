const fs = require('fs');
const path = require('path');
const url = require('url');
const got = require('got');
const { red, inverse, green } = require('kleur');
const { headers } = require('./references.js');

const get_request = (url, get_headers) => {
	return got(url, { headers: get_headers });
};

const post_request = (url, post_body, cookie) => {
	const post_headers = JSON.parse(JSON.stringify(headers));
	post_headers['Cookie'] = cookie;
	return got(url, {
		headers: post_headers,
		form: true,
		body: post_body,
		followRedirect: false
	});
};

// Convert set-cookie array in response's headers to string
const polish_cookies = cookie => cookie.map(c => c.substr(0, c.indexOf(';'))).reduce((a, b) => a + '; ' + b);

const find_access_token = cookie => {
	try {
		return cookie.match(/(?:access_token=)(\w{40})/)[1];
	} catch (error) {
		handle_error('Login failed');
	}
};

const err_msg = msg => `${inverse(red(' Error '))} ${msg}`;

const create_auth_headers = access_token => {
	return {
		'Authorization': `Bearer ${access_token}`
	};
};

const handle_error = error_message => {
	console.log(`\n\n${err_msg(error_message)}`);
	process.exit();
};

const extract_course_name = course_url => {
	try {
		const course_pathname = url.parse(course_url)['pathname'].split('/');
		const course_name_in_url =
			course_pathname[1] !== 'course' &&
			course_pathname[1] !== 'draft' &&
			course_pathname[1] !== 'gift'
				? course_pathname[1]
				: course_pathname[2];
		if (!course_name_in_url) {
			handle_error('Course URL is not valid');
		}

		if (course_pathname[1] === 'draft') {
			return {
				is_draft: true,
				course_name_in_url
			};
		}

		return {
			is_draft: false,
			course_name_in_url
		};
	} catch (error) {
		handle_error(error['message']);
	}
};

const load_cached_cookie_file = () => {
	const cached_cookie_path = path.join(process.cwd(), 'cached_cookie.json');
	try {
		const dataBuffer = fs.readFileSync(cached_cookie_path);
		return JSON.parse(dataBuffer.toString());
	} catch (error) {
		return [];
	}
};

const save_to_cached_cookie_file = accounts => {
	const cached_cookie_path = path.join(process.cwd(), 'cached_cookie.json');
	const accountsJSON = JSON.stringify(accounts);
	fs.writeFileSync(cached_cookie_path, accountsJSON);
};

const create_cached_cookie = (access_token, username) => {
	try {
		const data = load_cached_cookie_file();
		const duplicateIndex = data.findIndex(account => account.username === username);

		if (duplicateIndex === -1) {
			data.push({
				username,
				access_token
			});

			save_to_cached_cookie_file(data);
			console.log(`${green(inverse(' Cached cookie for future use '))}`);
		} else {
			data[duplicateIndex].access_token = access_token;
			save_to_cached_cookie_file(data);
			console.log(`${green(inverse(' Updated cached cookie '))}`);
		}
	} catch (error) {
		handle_error(error['message']);
	}
};

module.exports = {
	get_request,
	post_request,
	polish_cookies,
	find_access_token,
	handle_error,
	create_auth_headers,
	extract_course_name,
	create_cached_cookie,
	load_cached_cookie_file
};

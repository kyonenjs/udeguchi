const fs = require('fs');
const path = require('path');
const commander = require('commander');
const {yellow, red, inverse} = require('kleur');
const {search_url, draft_course_search_url, sub_domain} = require('./references.js');
const {handle_error, get_request, extract_course_name, render_spinner, green_bg, cyan_bg, path_exists} = require('./utilities.js');
const {download_course_contents} = require('./download.js');
const {login_with_username_password} = require('./login_methods.js');

const create_course_folder = (course_name, destination = process.cwd()) => {
	try {
		if (commander.output) {
			destination = path.resolve(commander.output);
		}

		const course_path = path.join(destination, course_name);

		if (!path_exists(course_path)) {
			fs.mkdirSync(course_path);
			console.log(
				`\nSaving course ${yellow(course_name)} to this location\n--> ${yellow(course_path)}`
			);
		}

		return course_path;
	} catch (error) {
		handle_error({error});
	}
};

const find_draft_course = async (headers, course_id) => {
	try {
		await get_request(`${draft_course_search_url}${course_id}`, headers);

		const get_draft_course_name_url = `https://${sub_domain}.udemy.com/api-2.0/courses/${course_id}?fields[course]=gift_url`;
		const response = await get_request(get_draft_course_name_url, headers);

		const course_path = create_course_folder(
			extract_course_name(JSON.parse(response['body'])['gift_url']).course_name_in_url
		);
		download_course_contents(course_id, headers, course_path);
	} catch (error) {
		if (error['statusCode'] === 403) {
			console.log(`  ${red(inverse(' Fail '))}\n\n`);
			if (commander.username && commander.password) {
				const auth_headers = await login_with_username_password(commander.username, commander.password);

				return find_owned_course(extract_course_name(commander.args[0]), auth_headers);
			}

			handle_error({error, message: 'You do not owned this course'});
		} else if (error['code'] === 'ENOTFOUND') {
			handle_error({error, message: 'Unable to connect to Udemy server'});
		}

		handle_error({error});
	}
};

const check_if_course_owned = (response_body, course_url_name) => {
	return JSON.parse(response_body)['results'].find(r => r['url'].split('/').includes(course_url_name));
};

const find_archived_course = async (headers, course_url_name) => {
	const search_archived_url = search_url.replace('subscribed-courses', 'archived-courses');

	const response = await get_request(`${search_archived_url}${course_url_name}`, headers);
	return check_if_course_owned(response.body, course_url_name);
};

const find_course_multi_requests = async (subscribed_url, headers, course_url_name) => {
	try {
		if (!subscribed_url) {
			return;
		}

		const response = await get_request(subscribed_url, headers);

		if (check_if_course_owned(response.body, course_url_name)) {
			return check_if_course_owned(response.body, course_url_name);
		}

		const data = JSON.parse(response.body);

		await find_course_multi_requests(data['next'], headers, course_url_name);
	} catch (error) {
		handle_error({error});
	}
};

const find_course = async (headers, course_url_name) => {
	try {
		const response = await get_request(`${search_url}${course_url_name}`, headers);

		let course_found = check_if_course_owned(response['body'], course_url_name);

		if (!course_found) {
			course_found = await find_archived_course(headers, course_url_name);

			if (!course_found) {
				const subscribed_url = search_url.replace('5&search=', '100&ordering=-last_accessed');
				const check_spinner = {stop: 0};
				console.log('\n');

				render_spinner(check_spinner, `${cyan_bg('Searching course')}`);

				course_found = await find_course_multi_requests(subscribed_url, headers, course_url_name);

				console.log(`  ${green_bg('Done')}`);
				clearTimeout(check_spinner.stop);

				if (!course_found) {
					handle_error({error: new Error('You do not own this course')});
				}
			}
		}

		const course_path = create_course_folder(course_url_name);
		download_course_contents(course_found['id'], headers, course_path);
	} catch (error) {
		if (error['statusCode'] === 403) {
			console.log(`  ${red(inverse(' Fail '))}\n\n`);

			// If user provide username and password
			// maybe 403 error because your cached cookie is not valid anymore
			// try to login with username and password again
			if (commander.username && commander.password) {
				const auth_headers = await login_with_username_password(
					commander.username,
					commander.password
				);

				return find_owned_course(extract_course_name(commander.args[0]), auth_headers);
			}

			handle_error({error, message: 'Cookie is not valid'});
		} else if (error['message'].includes('Cannot read property')) {
			handle_error({error, message: 'Course URL is not valid'});
		} else if (error['code'] === 'ENOTFOUND') {
			handle_error({error, message: 'Unable to connect to Udemy server'});
		}

		handle_error({error, message: 'You do not owned the course'});
	}
};

const find_owned_course = (course_name, auth_headers) => {
	const {is_draft, course_name_in_url} = course_name;

	if (is_draft) {
		find_draft_course(auth_headers, course_name_in_url);
	} else {
		find_course(auth_headers, course_name_in_url);
	}
};

module.exports = {
	find_owned_course
};

const fs = require('fs');
const path = require('path');
const commander = require('commander');
const { yellow, red, inverse } = require('kleur');
const { search_url, draft_course_search_url, sub_domain } = require('./references.js');
const { handle_error, get_request, extract_course_name } = require('./utilities.js');
const { download_course_contents } = require('./download.js');
const { login_with_username_password } = require('./login_methods.js');

const create_course_folder = (course_name, destination = process.cwd()) => {
	try {
		if (commander.output) {
			destination = path.resolve(commander.output);
		}

		if (!fs.existsSync(`${path.join(destination, course_name)}`)) {
			fs.mkdirSync(`${path.join(destination, course_name)}`);
			console.log(
				`\nSaving course ${yellow(course_name)} to this location\n--> ${yellow(
					path.join(destination, course_name)
				)}`
			);
		}

		return `${path.join(destination, course_name)}`;
	} catch (error) {
		handle_error(error['message']);
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
			handle_error('You do not owned this course');
		}

		handle_error(error['message']);
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

const find_course = async (headers, course_url_name) => {
	try {
		const response = await get_request(`${search_url}${course_url_name}`, headers);

		let course_found = check_if_course_owned(response['body'], course_url_name);

		if (!course_found) {
			course_found = await find_archived_course(headers, course_url_name);

			if (!course_found) {
				handle_error('You do not own this course');
			}
		}

		const course_path = create_course_folder(course_url_name);
		download_course_contents(course_found['id'], headers, course_path);
	} catch (error) {
		if (error['statusCode'] === 403) {
			console.log(`${red(inverse('Fail'))}\n\n`);

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

			handle_error('Cookie is not valid');
		} else if (error['message'].includes('Cannot read property')) {
			handle_error('Course URL is not valid');
		}

		handle_error('You do not owned the course');
	}
};

const find_owned_course = (course_name, auth_headers) => {
	const { is_draft, course_name_in_url } = course_name;

	if (is_draft === true) {
		find_draft_course(auth_headers, course_name_in_url);
	} else {
		find_course(auth_headers, course_name_in_url);
	}
};

module.exports = {
	find_owned_course
};
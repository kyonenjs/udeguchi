const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const commander = require('commander');
const got = require('got');
const { cyan, green, inverse, yellow, magenta, gray, red } = require('kleur');
const { headers: original_headers, sub_domain } = require('./references.js');
const { get_request, handle_error } = require('./utilities.js');

const create_chapter_folder = (content, course_path) => {
	const chapter_response_index = `${content[0]['object_index']}`;
	const chapter_name = `${chapter_response_index.padStart(2, '0')} ${content[0]['title']}`.replace(
		/[/\\?%*:|"<>]/g,
		'_'
	);

	console.log(`\n${green(inverse(' Chapter '))}  ${chapter_name}`);

	const chapter_path = path.join(course_path, chapter_name);

	try {
		if (!fs.existsSync(chapter_path)) {
			fs.mkdirSync(chapter_path);
		}

		return chapter_path;
	} catch (error) {
		handle_error(error['message']);
	}
};

// Save or download links not from Udemy
const download_asset_external_link = (asset_name, asset_title, asset) => {
	const asset_url = asset['external_url'];

	if (asset_title.match(/\b\.\w{1,4}\b/i)) {
		if (!fs.existsSync(asset_name)) {
			const stream = got.stream(asset_url, {
				headers: { 'User-Agent': original_headers['User-Agent'] }
			});
			stream.on('response', res => {
				res.pipe(fs.createWriteStream(asset_name));

				res.on('end', () => {
					console.log(`\n    ${gray(inverse(' Asset '))}  ${asset_title}  ${green(inverse(' Done '))}`);
				});
			}).resume();
		}
	} else {
		try {
			const data = fs.readFileSync(`${asset_name}.txt`).toString();
			const urls_in_file = data.split('\n');
			if (!urls_in_file.includes(asset['external_url'].trim())) {
				fs.appendFileSync(
					`${asset_name}.txt`,
					`${asset['external_url'].trim()}\n`
				);
			}
		} catch (error) {
			fs.writeFileSync(`${asset_name}.txt`, `${asset['external_url'].trim()}\n`);
		}
	}
};

// Download files with link from Udemy
const download_asset_file = (asset_name, asset_title, asset) => {
	const asset_url = asset['url_set']['File'][0]['file'];

	const stream = got.stream(asset_url, {
		headers: { 'User-Agent': original_headers['User-Agent'] }
	});
	stream.on('response', res => {
		res.pipe(fs.createWriteStream(asset_name));

		res.on('end', () => {
			console.log(`\n    ${gray(inverse(' Asset '))}  ${asset_title}  ${green(inverse(' Done '))}`);
		});
	}).resume();
};

const download_supplementary_assets = (content, chapter_path, lecture_index) => {
	if (content.length > 0) {
		const asset = content[0];
		const asset_title = `${lecture_index} ${asset['title']}`.replace(/[/\\?%*:|"<>]/g, '_');
		const asset_name = path.join(chapter_path, asset_title);

		if (asset['asset_type'] === 'ExternalLink') {
			download_asset_external_link(asset_name, asset_title, asset);
		}

		if (asset['asset_type'] === 'File') {
			if (fs.existsSync(asset_name)) {
				console.log(`\n    ${gray(inverse(' Asset '))}  ${asset_title}  ${yellow('(already downloaded)')}`);
			} else {
				download_asset_file(asset_name, asset_title, asset);
			}
		}

		content.shift();
		download_supplementary_assets(content, chapter_path, lecture_index);
	}
};

const download_lecture_article = (content, chapter_path) => {
	const article_response_index = `${content[0]['object_index']}`;
	const article_name = `${article_response_index.padStart(3, '0')} ${content[0]['title']}.html`.replace(
		/[/\\?%*:|"<>]/g,
		'_'
	);
	const article_body = content[0]['asset']['body'].replace(/\\\"/g, '"').replace(/\n+/g, '<br>');

	const new_article_body = `<html><head><link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous"></head><body><div class="container"><div class="row"><div class="col-md-10 col-md-offset-1"><p class="lead">${article_body}</p></div></div></div></body></html>`;

	const article_path = path.join(chapter_path, article_name);

	fs.writeFileSync(article_path, new_article_body);

	console.log(`\n  ${magenta(inverse(' Lecture '))}  ${article_name}  ${green().inverse(' Done ')}`);

	if (content[0]['supplementary_assets'].length > 0) {
		download_supplementary_assets(
			content[0]['supplementary_assets'],
			chapter_path,
			article_response_index.padStart(3, '0')
		);
	}
};

const download_subtitles = (sub, video_name, chapter_path) => {
	const subtitle_request_headers = {
		'User-Agent': 'okhttp/3.11.0'
	};

	if (commander.lang) {
		const lang = sub.find(lang =>
			lang['locale_id'].toLowerCase().includes(commander.lang.toLowerCase())
		);

		if (lang) {
			sub = [lang];
		}
	}

	try {
		sub.forEach(async subtitle => {
			const subtitle_url = subtitle['url'];
			const subtitle_lang = subtitle['locale_id'];

			const response = await get_request(subtitle_url, subtitle_request_headers);

			// From @wopen/vtt2srt npm package
			const data = response['body']
				.replace(/^WEBVTT/g, '')
				.replace(/(\d\d:\d\d)\.(\d\d\d)\b/g, '$1,$2')
				.replace(/(\n|\s)(\d\d:\d\d,\d\d\d)(\s|\n)/g, '$100:$2$3')
				.trim()
				.split(/(?:\r\n\r\n|\n\n|\r\r)/g)
				.map((piece, i) => `${i + 1}\n${piece}\n\n`)
				.join('');

			fs.writeFileSync(path.join(chapter_path, `${video_name}.${subtitle_lang}.srt`), data);
		});
	} catch (error) {
		handle_error(error['message']);
	}
};

const download_hls_video = async (url, video_name, chapter_path) => {
	try {
		const response = await get_request(
			url,
			{'User-Agent': original_headers['User-Agent']}
		);

		const video_resolutions = response.body
			.match(/(?:hls_)(\d{3,4})/g)
			.map(r => r.slice(4));

		let video_quality_index = 0;
		let quality_position = ' ';
		if (commander.quality) {
			video_quality_index = video_resolutions.findIndex(
				r => r === `${commander.quality}`
			);
			if (video_quality_index !== -1) {
				// -map p:1
				// choose second resolution
				quality_position = ` -map p:${video_quality_index} `;
			}
		}

		await save_video(url, quality_position, video_name, chapter_path);
	} catch (error) {
		handle_error(error['message']);
	}
};

const download_mp4_video = async (urls_location, video_name, chapter_path) => {
	try {
		const qualities = urls_location.map(q => parseInt(q['label'], 10));
		const sorted_qualities = qualities.sort((el1, el2) => el1 - el2).reverse();

		let quality_index = 0;
		if (commander.quality) {
			if (parseInt(commander.quality, 10)) {
				if (sorted_qualities.includes(parseInt(commander.quality, 10))) {
					quality_index = sorted_qualities.findIndex(
						i => i === parseInt(commander.quality, 10)
					);
				}
			}
		}

		const best_video_quality = urls_location.find(
			v => v['label'] === `${sorted_qualities[quality_index]}`
		);

		const video_url = best_video_quality['file'].replace(/&/g, '^&');

		await save_video(video_url, undefined, video_name, chapter_path);
	} catch (error) {
		handle_error(error['message']);
	}
};

const save_video = (url, quality_position, video_name, chapter_path) => {
	const ffmpeg_name = process.platform === 'win32' ? 'ffmpeg.exe' : 'ffmpeg';

	const download_command = quality_position ?
		`-y -i "${url}"${quality_position}-acodec copy -bsf:a aac_adtstoasc -vcodec` :
		`-headers "User-Agent: ${original_headers['User-Agent']}" -y -i ${url} -c`;

	return new Promise((resolve, reject) => {
		exec(
			`${path.join(process.cwd(), ffmpeg_name)} ${download_command} copy "${path.join(
				chapter_path,
				`${video_name}.mp4`
			)}"`,
			err => {
				if (err) {
					reject(new Error('Failed to download the video!'));
				}

				console.log(`  ${green().inverse(' Done ')}`);
				resolve('Done');
			}
		);
	});
};

const download_lecture_video = async (content, callback, course_path, chapter_Path) => {
	if (content[0]['_class'] === 'chapter') {
		chapter_Path = create_chapter_folder(content, course_path);
		content.shift();
		if (content.length === 0) {
			return;
		}
	}

	if (content[0]['_class'] === 'lecture' && content[0]['asset']['asset_type'] === 'Article') {
		download_lecture_article(content, chapter_Path);
		content.shift();
		if (content.length === 0) {
			return;
		}
	}

	if (content[0]['_class'] === 'lecture' && content[0]['asset']['asset_type'] === 'Video') {
		const video_lecture = content[0];

		const lecture_index = `${video_lecture['object_index']}`;
		const video_name = `${lecture_index.padStart(3, '0')} ${video_lecture['title']}`.replace(
			/[/\\?%*:|"<>]/g,
			'_'
		);

		if (!commander.skipSub) {
			if (video_lecture['asset']['captions'].length !== 0) {
				download_subtitles(video_lecture['asset']['captions'], video_name, chapter_Path);
			}
		}

		if (video_lecture['supplementary_assets'].length > 0) {
			download_supplementary_assets(
				video_lecture['supplementary_assets'],
				chapter_Path,
				lecture_index.padStart(3, '0')
			);
		}

		if (video_lecture['asset']['url_set']) {
			try {
				process.stdout.write(`\n  ${magenta(inverse(' Lecture '))}  ${video_name}`);

				if (fs.existsSync(path.join(chapter_Path, `${video_name}.mp4`))) {
					console.log(`  ${yellow('(already downloaded)')}`);
					return callback(content, chapter_Path);
				}

				const urls_location = video_lecture['asset']['url_set']['Video'];
				const hls_link = video_lecture['asset']['hls_url'];

				if (hls_link) {
					await download_hls_video(`https${hls_link.slice(5)}`, video_name, chapter_Path);
				} else {
					await download_mp4_video(urls_location, video_name, chapter_Path);
				}

				callback(content, chapter_Path);
			} catch (error) {
				handle_error(error['message']);
			}
		}
	} else {
		content.unshift(content[0]);
		callback(content, chapter_Path);
	}
};

const filter_course_data = (data, start, end) => {
	const lectures = data.filter(content => {
		try {
			return (
				content['_class'] === 'chapter' ||
				(content['_class'] === 'lecture' &&
					content['asset']['asset_type'] === 'Video') ||
				(content['_class'] === 'lecture' &&
					content['asset']['asset_type'] === 'Article')
			);
		} catch (error) {
			handle_error(error['message']);
		}
	});

	const chapters = data.filter(c => c['_class'] === 'chapter');

	if (start && parseInt(start, 10) <= chapters.length) {
		const start_index = lectures.findIndex(c => c['_class'] === 'chapter' && c['object_index'] === parseInt(start, 10));
		if (parseInt(end, 10) > parseInt(start, 10)) {
			const end_index = lectures.findIndex(c => c['_class'] === 'chapter' && c['object_index'] === parseInt(end, 10));
			if (end_index !== -1) {
				return lectures.splice(start_index, end_index - start_index);
			}
		}

		return lectures.splice(start_index);
	} else if (start && parseInt(start, 10) > chapters.length) {
		handle_error(`Course only have ${yellow(chapters.length)} chapters but you start at chapter ${red(start)}`);
	}

	if (end && parseInt(end, 10) <= chapters.length) {
		const end_index = lectures.findIndex(c => c['_class'] === 'chapter' && c['object_index'] === parseInt(end, 10));
		return lectures.splice(0, end_index);
	}

	return lectures;
};

const download_course_one_request = async (course_content_url, auth_headers, content, course_path, chapterPath) => {
	if (course_content_url) {
		try {
			const response = await get_request(`${course_content_url}10000`, auth_headers);

			process.stdout.write(`  ${green(inverse(' Done '))}\n`);

			const data = JSON.parse(response.body).results;

			const lectures = filter_course_data(data, commander.chapterStart, commander.chapterEnd);

			download_lecture_video(
				lectures,
				(course_contents, chapter_Path) => {
					course_contents.shift();
					download_course_one_request(
						undefined,
						undefined,
						course_contents,
						course_path,
						chapter_Path
					);
				},
				course_path,
				chapterPath
			);
		} catch (error) {
			if (error['statusCode'] === 502) {
				return download_course_multi_request(course_content_url, auth_headers, course_path);
			} else if (error['code'] === 'ENOTFOUND') {
				handle_error('Unable to connect to Udemy server');
			}

			handle_error(error['message']);
		}
	}

	if (content) {
		if (content.length !== 0) {
			download_lecture_video(
				content,
				(course_contents, chapter_Path) => {
					course_contents.shift();
					download_course_one_request(
						undefined,
						undefined,
						course_contents,
						course_path,
						chapter_Path
					);
				},
				course_path,
				chapterPath
			);
		}
	}
};

const download_course_multi_request = async (
	course_content_url,
	auth_headers,
	course_path,
	next_url,
	previous_data = []
) => {
	if (!course_content_url) {
		course_content_url = next_url;
	} else if (!course_content_url && !next_url) {
		previous_data.unshift(previous_data[0]);
		return download_course_one_request(undefined, undefined, course_path);
	} else {
		course_content_url += '200';
	}

	try {
		const response = await get_request(`${course_content_url}`, auth_headers);

		const data = JSON.parse(response.body);
		previous_data = [...previous_data, ...data['results']];
		download_course_multi_request(null, auth_headers, course_path, data['next'], previous_data);
	} catch (error) {
		handle_error(error['message']);
	}
};

const download_course_contents = (course_id, auth_headers, course_path) => {
	const course_content_url = `https://${sub_domain}.udemy.com/api-2.0/courses/${course_id}/subscriber-curriculum-items/?fields[lecture]=supplementary_assets,title,asset,object_index&fields[chapter]=title,object_index,chapter_index,sort_order&fields[asset]=title,asset_type,length,url_set,hls_url,captions,body,file_size,filename,external_url&page=1&locale=en_US&page_size=`;

	process.stdout.write(`\n\n${cyan().inverse(' Getting course information ')}`);
	download_course_one_request(course_content_url, auth_headers, undefined, course_path);
};

module.exports = {
	download_course_contents
};

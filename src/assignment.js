const fs = require('fs');
const path = require('path');

const {safe_name, path_exists, render_spinner, cyan_bg, green_bg, stream_download} = require('./utilities');

const got = require('got');
const {yellow} = require('kleur');

const download_assignment = async (content, object_index, chapter_path, auth_headers) => {
	const assignment_index = `${object_index}`.padStart(3, '0');
	const assignment_id = content.id;
	const question_name = safe_name(`${assignment_index} [assignment] ${content.title}.html`);
	const question_path = path.join(chapter_path, question_name);

	if (path_exists(question_path)) {
		return console.log(`\n     ${cyan_bg('Task')}  ${question_name}  ${yellow('(already downloaded)')}`);
	}

	const check_spinner = {stop: 0};
	console.log();

	render_spinner(check_spinner, `   ${cyan_bg('Task')}  ${question_name}`);

	const response_questions = await got(`https://www.udemy.com/api-2.0/practices/${assignment_id}/questions/?fields[practice_question]=body,answer`, {
		headers: auth_headers
	}).catch(error => {
		throw new Error(error.message);
	});

	const response_components = await got(`https://www.udemy.com/api-2.0/practices/${assignment_id}/components/?type=instruction&fields[practice_component]=body,asset,display_type&fields[asset]=asset_type,title,external_url,url_set`, {
		headers: auth_headers
	}).catch(error => {
		throw new Error(error.message);
	});

	const assignment_questions = JSON.parse(response_questions.body).results;
	const assignment_components = JSON.parse(response_components.body).results;

	await Promise.all(assignment_components.map(async component => {
		if (component['display_type'] === 'video') {
			const {file: url} = component['asset']['url_set']['Video'].find(quality => quality.label === '720');
			const video_name = safe_name(`${assignment_index} [assignment_video] ${content.title}.mp4`);
			const video_path = path.join(chapter_path, video_name);

			await stream_download(url, video_path);
		} else if (component['display_type'] === 'download') {
			const url = component['asset']['url_set']['File'][0]['file'];
			const file_name = safe_name(`${assignment_index} [assignment_file] ${content.title}${path.extname(component['asset']['title'])}`);
			const file_path = path.join(chapter_path, file_name);

			await stream_download(url, file_path);
		}
	}));

	const {body: instructions} = assignment_components.find(component => component['display_type'] === 'text');

	const instruction_html = `<div class="alert" role="alert"><h4><strong><i class="fa fa-sticky-note-o" aria-hidden="true"></i> Instructions</strong></h4><div class="alert" role="alert" style="background-color: #E9FBE9;border-left: 8px solid #52E052;">${instructions}</div></div>`;

	const questions_html = assignment_questions.map(({body: question, answer}, i) => {
		const currentIndex = i + 1;

		return `<div class="panel panel-info"><div class="panel-heading"><h4 class="panel-title"><a role="button" class="${i === 0 ? '' : 'collapsed'}" data-toggle="collapse" href="#question${currentIndex}">Question ${currentIndex}</a></h4></div><div id="question${currentIndex}" class="panel-collapse collapse${i === 0 ? ' in' : ''}"><div class="panel-body"><div class="panel panel-default"><div class="panel-heading"><h4 class="panel-title">${question}</h4></div></div><div class="panel panel-success"><div class="panel-heading"><h4 class="panel-title"><a class="collapsed" data-toggle="collapse" href="#answer${currentIndex}">Answer</a></h4></div><div id="answer${currentIndex}" class="panel-collapse collapse"><div class="panel-body"><div>${answer}</div></div></div></div></div></div></div>`;
	}).join('');

	const html = `<html><head><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.4.1/css/bootstrap.min.css"><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.4.1/components/image.min.css"><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"><style type="text/css">.panel-title>a:before{content:"\\f068";float:right !important;position:relative;top:1px;display:inline-block;font-family:FontAwesome;font-style:normal;font-weight:normal;line-height:1}.panel-title>a.collapsed:before{content:"\\f067"}.panel-title>a{text-decoration:none;display:block}</style> <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script> <script src="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.4.1/js/bootstrap.min.js"></script> </head><body><div class="container"><div class="row"><div class="col-md-10 col-md-offset-1 ui image"><p class="lead">${instruction_html}<div class="panel-group" id="accordion">${questions_html}</div></p></div></div></div></body></html>`;

	fs.writeFileSync(question_path, html);

	console.log(`  ${green_bg('Done')}`);
	clearTimeout(check_spinner.stop);
};

module.exports = download_assignment;

const fs = require('fs');
const path = require('path');

const got = require('got');
const {yellow} = require('kleur');

const {safe_name, path_exists, render_spinner, cyan_bg, green_bg} = require('./utilities');

const download_simple_quiz = async ({content, object_index, chapter_path, auth_headers}) => {
	const quiz_index = `${object_index}`.padStart(3, '0');
	const quiz_id = content.id;
	const quiz_name = safe_name(`${quiz_index} [quiz] ${content.title}.html`);
	const quiz_path = path.join(chapter_path, quiz_name);

	if (path_exists(quiz_path)) {
		return console.log(`\n     ${cyan_bg('Quiz')}  ${quiz_name}  ${yellow('(already downloaded)')}`);
	}

	const check_spinner = {stop: 0};
	console.log();

	render_spinner(check_spinner, `   ${cyan_bg('Quiz')}  ${quiz_name}`);

	const response = await got(`https://www.udemy.com/api-2.0/quizzes/${quiz_id}/assessments/?version=1&page_size=250&fields%5Bassessment%5D=id%2Cassessment_type%2Cprompt%2Ccorrect_response`, {
		headers: auth_headers
	}).catch(error => {
		throw new Error(error.message);
	});

	const quizzes = JSON.parse(response.body).results;

	const quizzesHTML = quizzes.map((quiz, i) => {
		const currentIndex = i + 1;

		const answers = quiz.prompt.answers.map((answer, answer_index) => {
			return `<div class="radio" style="display: flex; align-items: start"><span class="badge" style="margin-right: 15px;">${answer_index + 1}</span> <label><input type="radio" name="answer${currentIndex}">${answer}</label></div>`;
		}).join('');

		const correct_answer_position = quiz['correct_response'][0].charCodeAt() - 97;

		const correct_answer = quiz.prompt.answers[correct_answer_position];

		return `<div class="panel panel-info"><div class="panel-heading"><h4 class="panel-title"><a role="button" class="${i === 0 ? '' : 'collapsed'}" data-toggle="collapse" href="#question${currentIndex}">Question ${currentIndex}</a></h4></div><div id="question${currentIndex}" class="panel-collapse collapse${i === 0 ? ' in' : ''}"><div class="panel-body"><div class="panel panel-default"><div class="panel-heading"><h4 class="panel-title">${quiz.prompt.question}</h4></div><div class="panel-body">${answers}</div></div><div class="panel panel-success"><div class="panel-heading"><h4 class="panel-title"><a class="collapsed" data-toggle="collapse" href="#answer${currentIndex}">Correct Answer</a></h4></div><div id="answer${currentIndex}" class="panel-collapse collapse"><div class="panel-body" style="display: flex; align-items: start"><span class="badge" style="margin-right: 15px;">${correct_answer_position + 1}</span> <div>${correct_answer}</div></div></div></div></div></div></div>`;
	}).join('');

	const html = `<html><head><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.4.1/css/bootstrap.min.css"><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.4.1/components/image.min.css"><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"><style type="text/css">.panel-title>a:before{content:"\\f068";float:right !important;position:relative;top:1px;display:inline-block;font-family:FontAwesome;font-style:normal;font-weight:normal;line-height:1}.panel-title>a.collapsed:before{content:"\\f067"}.panel-title>a{text-decoration:none;display:block}</style> <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script> <script src="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.4.1/js/bootstrap.min.js"></script> </head><body><div class="container"><div class="row"><div class="col-md-10 col-md-offset-1 ui image"><p class="lead"><div class="panel-group" id="accordion">${quizzesHTML}</div></p></div></div></div></body></html>`;

	fs.writeFileSync(quiz_path, html);

	console.log(`  ${green_bg('Done')}`);
	clearTimeout(check_spinner.stop);
};

module.exports = {download_simple_quiz};

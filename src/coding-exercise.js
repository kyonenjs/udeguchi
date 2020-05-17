const fs = require('fs');
const got = require('got');
const path = require('path');

const download_coding_exercise = async ({quiz_id, quiz_index, quiz_title, quiz_path, chapter_path, auth_headers}) => {
	const response = await got(`https://www.udemy.com/api-2.0/quizzes/${quiz_id}/assessments/?version=1&page_size=250&fields%5Bassessment%5D=id%2Cassessment_type%2Cprompt%2Ccorrect_response`, {
		headers: auth_headers
	}).catch(error => {
		throw new Error(error.message);
	});

	const quiz = JSON.parse(response.body).results[0];

	const html = `<html><head><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.4.1/css/bootstrap.min.css"><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.4.1/components/image.min.css"><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"></head><body><div class="container"><div class="row"><div class="col-md-10 col-md-offset-1 ui image"><p class="lead"><div class="alert" role="alert"><h4><strong><i class="fa fa-sticky-note-o" aria-hidden="true"></i> Instructions</strong></h4><div class="alert alert-warning" role="alert">${quiz.prompt.instructions}</div></div></p></div></div></div></body></html>`;

	fs.writeFileSync(quiz_path, html);

	const {file_name: exercise_file_name, content: exercise_content} = quiz.prompt['initial_files'][0];
	const {file_name: solution_file_name, content: solution_content} = quiz.prompt['solution_files'][0];

	const exercise_name = `[exercise] ${quiz_title}${path.extname(exercise_file_name)}`;
	const solution_name = `[exercise_solution] ${quiz_title}${path.extname(solution_file_name)}`;

	const exercise_path = path.join(chapter_path, `${quiz_index} ${exercise_name}`);
	const solution_path = path.join(chapter_path, `${quiz_index} ${solution_name}`);

	fs.writeFileSync(exercise_path, exercise_content);

	fs.writeFileSync(solution_path, solution_content);
};

module.exports = {download_coding_exercise};

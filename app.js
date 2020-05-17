try {
	require.resolve('commander');
} catch (error) {
	console.log('\nnpm dependencies not found\nPlease follow steps here: https://github.com/kyonenjs/udeguchi#require');
	process.exit();
}

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const commander = require('commander');
const {yellow} = require('kleur');

commander
	.name('app.js')
	.usage('<url> [options]')
	.version(require('./package.json').version, '-v, --version')
	.option('-u, --username <username>', 'Login with username (required `--password` option)')
	.option('-p, --password <password>', 'Login with password (required `--username` option)')
	.option('-k, --cookie <cookie>', 'Cookie File Name')
	.option('--skip-sub', 'Skip subtitles')
	.option('--lang <language>', 'Only download subtitle with this language')
	.option('-q, --quality <quality>', 'Video Quality')
	.option('-o, --output <location>', 'Download files to this location')
	.option('--chapter-start <chapterNumber>', 'Start download at this chapter')
	.option('--chapter-end <chapterNumber>', 'Stop download at this chapter (not include)')
	.option('--lecture <lectureNumber>', 'Download this lecture only')
	.option('--no-hls', 'Use normal https server to download video')
	.parse(process.argv);

const {handle_error, extract_course_name} = require('./src/utilities.js');
const {find_owned_course} = require('./src/search.js');
const {login_with_username_password, login_with_cookie} = require('./src/login_methods.js');
const {use_cached_cookie} = require('./src/login_cached.js');

if (commander.chapterStart && !(parseInt(commander.chapterStart, 10) > 0)) {
	handle_error({error: new Error('Invalid chapter')});
}

if (!commander.chapterStart && commander.chapterEnd && !(parseInt(commander.chapterEnd, 10) > 1)) {
	handle_error({error: new Error('--chapter-end should be greater than 1')});
}

commander.lecture && !(parseInt(commander.lecture, 10) > 0) && handle_error({error: new Error('Invalid lecture number')});

const ffmpeg_name = process.platform === 'win32' ? 'ffmpeg.exe' : 'ffmpeg';

const course_url = commander.args[0];

if (fs.existsSync(path.join(process.cwd(), ffmpeg_name))) {
	if (commander.output && !fs.existsSync(commander.output)) {
		handle_error({error: new Error(`Location ${yellow(path.resolve(commander.output))} does not exist!`)});
	}

	if (!commander.username && !commander.password && !commander.cookie) {
		const rl = readline.createInterface(process.stdin, process.stdout);

		let username = '';
		let password = '';

		rl.question(`\n${yellow('Username')}: `, mail => {
			username = mail;
			rl.setPrompt(`${yellow('Password')}: `);
			rl.prompt();

			rl.on('line', pass => {
				password = pass;
				rl.close();
			});
		});

		rl.on('close', () => {
			(async () => {
				if (fs.existsSync(path.join(process.cwd(), 'cached_cookie.json'))) {
					return use_cached_cookie(username, password);
				}

				const auth_headers = await login_with_username_password(username, password);

				find_owned_course(extract_course_name(course_url), auth_headers);
			})();
		});
	}

	if (commander.username && commander.password) {
		(async () => {
			if (fs.existsSync(path.join(process.cwd(), 'cached_cookie.json'))) {
				return use_cached_cookie(commander.username, commander.password);
			}

			const auth_headers = await login_with_username_password(commander.username, commander.password);

			find_owned_course(extract_course_name(course_url), auth_headers);
		})();
	}

	if (commander.cookie) {
		const auth_headers = login_with_cookie(commander.cookie);

		find_owned_course(extract_course_name(course_url), auth_headers);
	}
} else {
	handle_error({error: new Error('ffmpeg not found. Please follow: https://github.com/kyonenjs/udeguchi#Require')});
}

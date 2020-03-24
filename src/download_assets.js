const fs = require('fs');
const path = require('path');
const got = require('got');
const {magenta, gray, yellow, inverse} = require('kleur');
const {headers: original_headers} = require('./references.js');
const {green_bg, safe_name, handle_error} = require('./utilities');

// Save links not from Udemy
const download_asset_external_link = (chapter_path, lecture_index, asset) => {
	const asset_name = safe_name(`${lecture_index} ${asset['filename']}`);
	const asset_name_with_path = path.join(chapter_path, asset_name);
	const asset_url = asset['external_url'];

	try {
		const data = fs.readFileSync(`${asset_name_with_path}.txt`).toString();
		const urls_in_file = data.split('\n');
		if (!urls_in_file.includes(asset_url.trim())) {
			fs.appendFileSync(`${asset_name_with_path}.txt`, `${asset_url.trim()}\n`);
		}
	} catch (error) {
		fs.writeFileSync(`${asset_name_with_path}.txt`, `${asset_url.trim()}\n`);
	}
};

// Download files with link from Udemy
const download_asset_file = async ({chapter_path, lecture_index, asset}) => {
	const is_ebook = (typeof asset['asset'] === 'object' && asset['asset']['asset_type'] === 'E-Book') || false;
	const [asset_name, asset_url] = is_ebook ?
		[
			safe_name(`${lecture_index} ${asset['title']}.pdf`),
			asset['asset']['url_set']['E-Book'][0]['file']
		] :
		[
			safe_name(`${lecture_index} ${asset['filename']}`),
			asset['url_set']['File'][0]['file']
		];
	const asset_name_with_path = path.join(chapter_path, asset_name);
	const asset_id = asset['id'];
	const asset_size = asset['file_size'];

	if (fs.existsSync(asset_name_with_path)) {
		is_ebook ?
			console.log(`\n  ${magenta().inverse(' Lecture ')}  ${asset_name}  ${yellow('(already downloaded)')}`) :
			console.log(`\n    ${gray(inverse(' Asset '))}  ${asset_name}  ${yellow('(already downloaded)')}`);
	} else {
		await save_asset({
			is_ebook,
			asset_url,
			asset_name,
			asset_id,
			asset_size,
			chapter_path,
			lecture_index
		}).catch(error => {
			is_ebook
			? process.stderr.write(`\n  ${magenta().inverse(' Lecture ')}  ${asset_name}`)
			: process.stderr.write(`\n    ${gray(inverse(' Asset '))}  ${asset_name}`);

			throw error;
		});
	}
};

const save_asset = ({is_ebook, asset_url, asset_name, asset_id, asset_size, chapter_path, lecture_index}) => {
	const asset_name_with_path = path.join(chapter_path, asset_name);
	const downloading_asset_name_with_path = asset_size < 100000
		? asset_name_with_path
		: path.join(chapter_path, `${lecture_index} downloading asset ${asset_id}`);

	return new Promise((resolve, reject) => {
		const stream = got.stream(asset_url, {
			headers: {'User-Agent': original_headers['User-Agent']}
		});
		stream
			.on('response', res => {
				res.pipe(fs.createWriteStream(downloading_asset_name_with_path));

				res.on('end', () => {
					if (asset_size > 100000 || !asset_size) {
						fs.rename(downloading_asset_name_with_path, asset_name_with_path, (error) => {
							if (error) {
								handle_error(`Unable to rename asset ${yellow(asset_name)}`);
							}
						});
					}

					is_ebook
					? console.log(`\n  ${magenta().inverse(' Lecture ')}  ${asset_name}  ${green_bg('Done')}`)
					: console.log(`\n    ${gray(inverse(' Asset '))}  ${asset_name}  ${green_bg('Done')}`);
					resolve('Finish');
				});
			})
			.resume()
			.on('error', (error) => {
				reject(error);
			});
	});
};

const download_supplementary_assets = async (content, chapter_path, lecture_index) => {
	if (content.length > 0) {
		const asset = content[0];

		if (asset['asset_type'] === 'ExternalLink') {
			download_asset_external_link(chapter_path, lecture_index, asset);
		}

		if (asset['asset_type'] === 'File') {
			await download_asset_file({chapter_path, lecture_index, asset});
		}

		if (typeof asset['asset'] === 'object' && asset['asset']['asset_type'] === 'E-Book') {
			await download_asset_file({chapter_path, lecture_index, asset});
		}

		content.shift();
		download_supplementary_assets(content, chapter_path, lecture_index);
	}
};

module.exports = {
	download_supplementary_assets
};

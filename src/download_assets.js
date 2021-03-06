const fs = require('fs');
const path = require('path');
const {gray, yellow, inverse} = require('kleur');
const {green_bg, safe_name, handle_error, stream_download, path_exists} = require('./utilities');

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
	} catch (_) {
		fs.writeFileSync(`${asset_name_with_path}.txt`, `${asset_url.trim()}\n`);
	}
};

// Download files with link from Udemy
const download_asset_file = async ({chapter_path, lecture_index, asset}) => {
	const asset_name = safe_name(`${lecture_index} ${asset['filename']}`);
	const asset_name_with_path = path.join(chapter_path, asset_name);
	const asset_url = asset['url_set']['File'][0]['file'];
	const asset_id = asset['id'];
	const asset_size = asset['file_size'];

	if (path_exists(asset_name_with_path)) {
		return console.log(`\n    ${gray(inverse(' Asset '))}  ${asset_name}  ${yellow('(already downloaded)')}`);
	}

	await save_asset({
		asset_url,
		asset_name,
		asset_id,
		asset_size,
		chapter_path,
		lecture_index
	}).catch(error => {
		process.stderr.write(`\n    ${gray(inverse(' Asset '))}  ${asset_name}`);

		throw error;
	});
};

const save_asset = async ({asset_url, asset_name, asset_id, asset_size, chapter_path, lecture_index}) => {
	const asset_name_with_path = path.join(chapter_path, asset_name);
	const downloading_asset_name_with_path = asset_size < 100000 ?
		asset_name_with_path :
		path.join(chapter_path, `${lecture_index} downloading asset ${asset_id}`);

	await stream_download(
		asset_url, downloading_asset_name_with_path
	).catch(error => {
		throw error;
	});

	if (asset_size > 100000 || !asset_size) {
		fs.rename(downloading_asset_name_with_path, asset_name_with_path, error => {
			if (error) {
				handle_error({error, message: `Unable to rename asset ${yellow(asset_name)}`});
			}
		});
	}

	console.log(`\n    ${gray(inverse(' Asset '))}  ${asset_name}  ${green_bg('Done')}`);
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

		content.shift();
		download_supplementary_assets(content, chapter_path, lecture_index);
	}
};

module.exports = {
	download_supplementary_assets
};

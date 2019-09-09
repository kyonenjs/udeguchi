const fs = require('fs');
const path = require('path');
const got = require('got');
const {gray, yellow, inverse} = require('kleur');
const {headers: original_headers} = require('./references.js');
const {green_bg, safe_name, handle_error} = require('./utilities');

// Save or download links not from Udemy
const download_asset_external_link = (chapter_path, lecture_index, asset) => {
	const asset_name = safe_name(`${lecture_index} ${asset['title']}`);
	const asset_name_with_path = path.join(chapter_path, asset_name);
	const asset_url = asset['external_url'];
	const asset_id = asset['id'];

	if (asset_name.match(/\b\.\w{1,4}\b/i)) {
		if (!fs.existsSync(asset_name_with_path)) {
			save_asset({
				asset_url,
				asset_name,
				asset_id,
				chapter_path,
				lecture_index
			});
		}
	} else {
		try {
			const data = fs.readFileSync(`${asset_name_with_path}.txt`).toString();
			const urls_in_file = data.split('\n');
			if (!urls_in_file.includes(asset_url.trim())) {
				fs.appendFileSync(`${asset_name_with_path}.txt`, `${asset_url.trim()}\n`);
			}
		} catch (error) {
			fs.writeFileSync(`${asset_name_with_path}.txt`, `${asset_url.trim()}\n`);
		}
	}
};

// Download files with link from Udemy
const download_asset_file = ({chapter_path, lecture_index, asset}) => {
	const asset_name = safe_name(`${lecture_index} ${asset['filename']}`);
	const asset_name_with_path = path.join(chapter_path, asset_name);
	const asset_url = asset['url_set']['File'][0]['file'];
	const asset_id = asset['id'];

	if (fs.existsSync(asset_name_with_path)) {
		console.log(`\n    ${gray(inverse(' Asset '))}  ${asset_name}  ${yellow('(already downloaded)')}`);
	} else {
		save_asset({
			asset_url,
			asset_name,
			asset_id,
			chapter_path,
			lecture_index
		});
	}
};

const save_asset = ({asset_url, asset_name, asset_id, chapter_path, lecture_index}) => {
	const asset_name_with_path = path.join(chapter_path, asset_name);
	const downloading_asset_name_with_path = path.join(chapter_path, `${lecture_index} downloading asset ${asset_id}`);

	const stream = got.stream(asset_url, {
		headers: {'User-Agent': original_headers['User-Agent']}
	});
	stream
		.on('response', res => {
			res.pipe(fs.createWriteStream(downloading_asset_name_with_path));

			res.on('end', () => {
				fs.access(downloading_asset_name_with_path, (error) => {
					if (error) {
						handle_error(`Unable to find asset ${yellow(path.parse(downloading_asset_name_with_path)['base'])}`);
					}

					fs.rename(downloading_asset_name_with_path, asset_name_with_path, (error) => {
						if (error) {
							handle_error(`Unable to rename asset ${yellow(asset_name)}`);
						}

						console.log(`\n    ${gray(inverse(' Asset '))}  ${asset_name}  ${green_bg('Done')}`);
					});
				});
			});
		})
		.resume();
};

const download_supplementary_assets = (content, chapter_path, lecture_index) => {
	if (content.length > 0) {
		const asset = content[0];

		if (asset['asset_type'] === 'ExternalLink') {
			download_asset_external_link(chapter_path, lecture_index, asset);
		}

		if (asset['asset_type'] === 'File') {
			download_asset_file({chapter_path, lecture_index, asset});
		}

		content.shift();
		download_supplementary_assets(content, chapter_path, lecture_index);
	}
};

module.exports = {
	download_supplementary_assets
};

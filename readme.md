> Use to download Udemy courses  
> Windows, macOS, Linux ? No problem, support all

## Highlights

- Support download 1080p
- Support download draft courses
- Support download with business account
- Login with cookie
- Download subtitle with the language you want
- Choose video quality to download
- Actively maintained

## Start
- You can use the green download button above  
  or download app with this link : https://github.com/kyonenjs/udeguchi/archive/master.zip
  
![download](https://user-images.githubusercontent.com/52479148/60701779-136d9380-9f27-11e9-8993-6071e910cd23.png)

>&nbsp;&nbsp;&nbsp;&nbsp; Or if you use [git](https://git-scm.com/)  
>&nbsp;&nbsp;&nbsp;&nbsp; you can clone this app with command  
>&nbsp;&nbsp;&nbsp; **`git clone https://github.com/kyonenjs/udeguchi.git`**

## Require
### &#x2198; NodeJS
```
You can download and install at : https://nodejs.org/en/
```
### &#x2198; ffmpeg

```
- Windows 64-bit : https://ffmpeg.zeranoe.com/builds/win64/static/ffmpeg-4.1.3-win64-static.zip
- Windows 32-bit : https://ffmpeg.zeranoe.com/builds/win32/static/ffmpeg-4.1.3-win32-static.zip
- macOS          : https://evermeet.cx/ffmpeg/ffmpeg-4.1.3.dmg
- Linux 64-bit   : https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-amd64-static.tar.xz
- Linus 32-bit   : https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-i686-static.tar.xz

But i don't know my system is 64-bit or 32-bit ?
Use command: node -p process.arch
x64 is 64-bit
x32 is 32-bit
```
### `After download`

> **Windows**
```
Unzip, open folder just unzipped, go to '/bin' folder
and copy file name 'ffmpeg.exe' (Windows) into udeguchi folder.
```

> **macOS**
```
Open '.dmg' file just downloaded above, move file name 'ffmpeg' into udeguchi folder.
```

> **Linux**
```
Unzip with right click and "Extract here"
  or open terminal and unzip with command:
  + 64-bit: tar xvf ffmpeg-release-amd64-static.tar.xz
  + 32-bit: tar xvf ffmpeg-release-i686-static.tar.xz
  
Open folder just unzipped, copy file name 'ffmpeg' into udeguchi folder.
```
### &#x2198; npm dependencies
```
*require node installed*

inside udeguchi folder, open terminal and type command: npm install
```
## Usage
```
$ node app.js https://www.udemy.com/course-name/

Username: udeguchi@github.com
Password: udeguchi
```
Command above will

`- download highest video quality`
 
`- download all subtitles`

## Login with cookie ? How ?
```
$ node app.js -k cookie.txt https://www.udemy.com/course-name/
```
### `Do you have step by step guide ? Of course ^^`  

 * [Chrome users](https://github.com/kyonenjs/udeguchi/issues/1#issuecomment-508435783)

 * [Firefox users](https://github.com/kyonenjs/udeguchi/issues/1#issuecomment-508431489)

## Options
### `What options we have here`
  * `-k` _or_ `--cookie`&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;›&nbsp;&nbsp;Login with cookie
  * `-u` _or_ `--username`&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;›&nbsp;&nbsp;Username
  * `-p` _or_ `--password`&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;›&nbsp;&nbsp;Password
  * `--lang <language>`&nbsp;&nbsp;&nbsp;&nbsp;›&nbsp;&nbsp;Only download subtitles with this language  
  * `--skip-sub`&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;›&nbsp;&nbsp;​Skip download subtitles  
  * `-q` _or_ `--quality`&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;›&nbsp;&nbsp;Download video with this quality if available  
  * `-o` _or_ `--output`&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;›&nbsp;&nbsp;Download course to this location  

### `That's good, but how to use it ?`
* `-k` _or_ `--cookie`&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;›&nbsp;&nbsp;Login with cookie
```
$ node app.js -k cookie.txt https://www.udemy.com/course-name/

or

$ node app.js --cookie cookie.txt https://www.udemy.com/course-name/
```
> &nbsp;  
> &nbsp;  
  * `-u` _or_ `--username`&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;›&nbsp;&nbsp;Username
  * `-p` _or_ `--password`&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;›&nbsp;&nbsp;Password
```
$ node app.js -u udeguchi@github.com -p udeguchi https://www.udemy.com/course-name/

or

$ node app.js --username udeguchi@github.com --password udeguchi https://www.udemy.com/course-name/
```
> &nbsp;  
> &nbsp;  
  * `--skip-sub`&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;›&nbsp;&nbsp;​Skip download subtitles
```
$ node app.js --skip-sub https://www.udemy.com/course-name/
```
> &nbsp;  
> &nbsp;  
  * `--lang <language>`&nbsp;&nbsp;&nbsp;&nbsp;›&nbsp;&nbsp;Only download subtitles with this language

<code>** Use short form of language listed here : https://www.w3schools.com/tags/ref_language_codes.asp</code>  
> If link is not working for some reason, please Google: **ISO 639-1 Language Codes**
```
$ node app.js --lang en https://www.udemy.com/course-name/
```
> &nbsp;  
> &nbsp;  
  * `-q` _or_ `--quality`&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;›&nbsp;&nbsp;Download video with this quality if available
> **Options:** `144` `360` `480` `720` `1080`  
```
$ node app.js -q 1080 https://www.udemy.com/course-name/

or

$ node app.js --quality 1080 https://www.udemy.com/course-name/
```
> &nbsp;  
> &nbsp;  
  * `-o` _or_ `--output`&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;›&nbsp;&nbsp;Download course to this location
```
<Full path>
$ node app.js -o C:\Users\udeguchi\Desktop https://www.udemy.com/course-name/

<Relative path>
$ node app.js -o ..\newLocation https://www.udemy.com/course-name/

or 

$ node app.js --output ..\newLocation https://www.udemy.com/course-name/ 
```

## License

MIT
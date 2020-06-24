> Use to download Udemy courses  
> Windows, macOS, Linux ? No problem, support all

## Highlights

- Support download 1080p
- Support download draft courses
- Support download with business account
- Support download selected chapters
- Support download selected lecture
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

### `You can download and install at:`
- https://nodejs.org/en/

### &#x2198; ffmpeg

### `Link download`

- [Windows 64-bit](https://ffmpeg.zeranoe.com/builds/win64/static/ffmpeg-4.3-win64-static.zip)
- [Windows 32-bit](https://ffmpeg.zeranoe.com/builds/win32/static/ffmpeg-4.3-win32-static.zip)
- [macOS](https://evermeet.cx/ffmpeg/ffmpeg-4.3.zip)
- [Linux 64-bit](https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-amd64-static.tar.xz)
- [Linux 32-bit](https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-i686-static.tar.xz)

```
But i don't know my system is 64-bit or 32-bit ?
Use command: node -p process.arch
x64 is 64-bit
x32 is 32-bit
```

### `After download`

> **Windows**
```
Unzip, open folder just unzipped, go to '/bin' folder
and copy file name 'ffmpeg.exe' into udeguchi folder.
```

> **macOS**
```
Unzip file just downloaded above and move file name 'ffmpeg' into udeguchi folder.
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
*require nodejs installed*

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
> &nbsp;  
> &nbsp;  
### `Use with options`
```
$ node app.js https://www.udemy.com/course-name/ -q 480 --lang en --chapter-end 5 -o ../udemy_courses
```
Command above will  

`- download video with quality 480p`  

`- only download English subtitles`  

`- download until chapter 5 (not include chapter 5)`  

`- download course to a folder name 'udemy_courses' outside udeguchi folder`

## Login with cookie ? How ?
```
$ node app.js -k cookie.txt https://www.udemy.com/course-name/
```
### `Do you have step by step guide ? Of course ^^`  

 * [Chrome users](https://github.com/kyonenjs/udeguchi/issues/1#issuecomment-508435783)

 * [Firefox users](https://github.com/kyonenjs/udeguchi/issues/1#issuecomment-508431489)

## Options
### `What options we have here`
|Options               |                                                   |
|---                   |---                                                |
|`-k` _or_ `--cookie`  |Login with cookie                                  |
|`-u` _or_ `--username`|Login with username (required `--password` option) |
|`-p` _or_ `--password`|Login with password (required `--username` option) |
|`--lang`              |Only download subtitles with this language         |
|`--skip-sub`          |Skip download subtitles                            |
|`-q` _or_ `--quality` |Download video with this quality if available      |
|`-o` _or_ `--output`  |Download course to this location                   |
|`--chapter-start`     |Start download at this chapter                     |
|`--chapter-end`       |Stop download at this chapter (not include)        |
|`--lecture`           |Download this lecture only                         |
|`--no-hls`            |Use normal https server to download video          |

### `That's good, but how to use it ?`

|Option||
|:---:|---|
|`-k` _or_ `--cookie`|Login with cookie|

```
$ node app.js -k cookie.txt https://www.udemy.com/course-name/

or

$ node app.js --cookie cookie.txt https://www.udemy.com/course-name/
```
> &nbsp;  
> &nbsp;  

|Option||
|:---:|---|
|`-u` _or_ `--username`|Login with username (required `--password` option) |
|`-p` _or_ `--password`|Login with password (required `--username` option) |

```
$ node app.js -u udeguchi@github.com -p udeguchi https://www.udemy.com/course-name/

or

$ node app.js --username udeguchi@github.com --password udeguchi https://www.udemy.com/course-name/
```
> &nbsp;  
> &nbsp;  

|Option||
|:---:|---|
|`--skip-sub`|​Skip download subtitles|

```
$ node app.js --skip-sub https://www.udemy.com/course-name/
```
> &nbsp;  
> &nbsp;  

|Option||
|:---:|---|
|`--lang <language>`|Only download subtitles with this language|

<code>** Use short form of language listed here : https://www.w3schools.com/tags/ref_language_codes.asp</code>  
> If link is not working for some reason, please Google: **ISO 639-1 Language Codes**
```
$ node app.js --lang en https://www.udemy.com/course-name/
```
> &nbsp;  
> &nbsp;  

|Option||
|:---:|---|
|`-q` _or_ `--quality`|Download video with this quality if available|
> **Available qualities:** `144` `360` `480` `720` `1080`  
```
$ node app.js -q 1080 https://www.udemy.com/course-name/

or

$ node app.js --quality 1080 https://www.udemy.com/course-name/
```
> &nbsp;  
> &nbsp;  

|Option||
|:---:|---|
|`-o` _or_ `--output`|Download course to this location|

```
<Full path>
$ node app.js -o C:\Users\udeguchi\Desktop https://www.udemy.com/course-name/

<Relative path>
$ node app.js -o ..\newLocation https://www.udemy.com/course-name/

or 

$ node app.js --output ..\newLocation https://www.udemy.com/course-name/ 
```
> &nbsp;  
> &nbsp;  

|Option||
|:---:|---|
|`--chapter-start <chapterNumber>`|Start download at this chapter|
|`--chapter-end <chapterNumber>`|Stop download at this chapter (not include)|

```
<Download from chapter 3 to end>
$ node app.js --chapter-start 3 https://www.udemy.com/course-name/

or 

<Download from chapter 2 to chapter 5 (not include chapter 5)>
$ node app.js --chapter-start 2 --chapter-end 5 https://www.udemy.com/course-name/

or 

<Download from begin to chapter 7 (not include chapter 7)>
$ node app.js --chapter-end 7 https://www.udemy.com/course-name/
```
> &nbsp;  
> &nbsp;  

|Option||
|:---:|---|
|`--lecture <lectureNumber>`|Download this lecture only|

```
$ node app.js --lecture 12 https://www.udemy.com/course-name/
```
> &nbsp;  
> &nbsp; 

|Option||
|:---:|---|
|`--no-hls`|Use normal https server to download video.|

```
$ node app.js --no-hls https://www.udemy.com/course-name/
```

## License

MIT
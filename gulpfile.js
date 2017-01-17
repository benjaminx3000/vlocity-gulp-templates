// global requires
var gulp = require('gulp');
var pkg = require('./package.json');
var bundlesDir = 'src/ux-components';

// Tasks
require('./gulpfile.cards.js');

//Path config
var config = {
	copy: {
		src: ['**/*.png', '**/*.svg', '**/*.jpg', '**/*.gif', '**/fonts/*', '**/*.css']
	},
	styles: {
		src:['**/main.scss', '**/*.main.scss'],
		processors: {
			// used for post css
		}
	},
	scripts: {
		src: ['**/*.main.js', '**/*.module.js', '**/*.js']
	},
	templates: {
		src:['**/*.html', '**/*.ngtpl'],
	},
	datapacks: {
		src: ['src/data-packs/**/*.html']
	},
	watch: {
		styles: [`${bundlesDir}/**/*.scss`],
		scripts: [`${bundlesDir}/**/*.js`],
		templates: [`${bundlesDir}/**/*.html`, '**/*.ngtpl'],
		datapacks: ['src/data-packs/**/*.html']
	},
	dest: 'resource-bundles',
	build: 'build'
};

// Default task
gulp.task('default', ['sass', 'uglify', 'templates', 'copy', 'connect', 'watch']);
gulp.task('build', ['sass', 'uglify', 'templates', 'copy']);

//Public tasks
// gulp.task('bower', bower);
gulp.task('clean', clean);
gulp.task('copy', copy);
gulp.task('connect', connect);
gulp.task('sass', sass);
gulp.task('templates', templates)
gulp.task('uglify', uglify);
gulp.task('watch', watch);
gulp.task('zip', zip);

//Method definitions

function bower() {
	// UNUSED
	// TODO: this needs to be modularized
	// maybe use some sort of requrie instead?
		var concat = require('gulp-concat');
    var mainBowerFiles = require('gulp-main-bower-files');
    var plumber = require('gulp-plumber');
		var rename = require('gulp-rename');

    return gulp.src('bower.json')
      .pipe(plumber({errorHandler: onError}))
      .pipe(mainBowerFiles({
        overrides: {
          'bootstrap-sass': {
            'main': []
          }
        }
      }))
      .pipe(concat('libs.js'))
      .pipe(gulp.dest(config.libs.dest));
};

function clean(cb) {
	var del = require('del');
	del(config.build, cb);
}

// NOTE: In order to use proxly in conjunction with salesforce
// we're setting conntect's method to https here.
// go to: <chrome://flags/#allow-insecure-localhost> and enable 'allow-insecure-localhost'
// otherwise our files are going to be blocked!
function connect() {
	var connect = require('gulp-connect');

	connect.server({
		root: './',
		https: true,
		debug: true,
		port: 3000
	})
}

function copy() {
	bundle(config.copy.src, (src, dest) => {
		return gulp.src(src)
			.pipe(gulp.dest(config.build))
			.pipe(gulp.dest(`${config.dest}/${pkg.name_space ? pkg.name_space + '_' : ''}${dest}.resource`));
	});
}

function sass() {
	// var cssnano = require('gulp-cssnano');
	var plumber = require('gulp-plumber');
	var rename = require('gulp-rename');
	var sass = require('gulp-sass');
	var sourcemaps = require('gulp-sourcemaps');

	bundle(config.styles.src, (src, dest) => {
		return gulp.src(src)
			.pipe(plumber({errorHandler: onError}))
			.pipe(sourcemaps.init())
			.pipe(sass({includePaths: [
				'bower_components/bootstrap-sass/assets/stylesheets',
				'bower_components'
			]}))
			// .pipe(cssnano())
			.pipe(rename(dest + '.min.css'))
			.pipe(sourcemaps.write('./'))
			.pipe(gulp.dest(config.build))
			.pipe(gulp.dest(`${config.dest}/${pkg.name_space ? pkg.name_space + '_' : ''}${dest}.resource`));
		});
}

function templates() {
	var concat = require('gulp-concat');
	var plumber = require('gulp-plumber');
	var rename = require('gulp-rename');
	var templatecache = require('gulp-angular-templatecache');
	var uglify = require('gulp-uglify');

	bundle(config.templates.src, (src, dest) => {
	  return gulp.src(src)
	    .pipe(plumber({errorHandler: onError}))
		.pipe(rename({dirname: ''}))
	    .pipe(templatecache({standalone: true, module: `${dest}-templates`}))
	    .pipe(concat(dest + '.templates.min.js'))
			.pipe(uglify({mangle: false}))
			.pipe(gulp.dest(config.build))
	    .pipe(gulp.dest(`${config.dest}/${pkg.name_space ? pkg.name_space + '_' : ''}${dest}.resource`));
	});
}

function uglify() {
		var concat = require('gulp-concat');
		var include = require('gulp-include');
		var plumber = require('gulp-plumber');
		var notify = require('gulp-notify');
		var rename = require('gulp-rename');
		var sourcemaps = require('gulp-sourcemaps');
		var uglify = require('gulp-uglify');
		

		bundle(config.scripts.src, (src, dest) => {
		console.log(src);
			return gulp.src(src)
				.pipe(plumber({errorHandler: onError}))
				.pipe(include({
					extensions: 'js',
					includePaths: ['bower_components','./']
				}))
				.pipe(sourcemaps.init())
				.pipe(concat(dest + '.min.js'))
				.pipe(uglify())
				.pipe(sourcemaps.write('./'))
				.pipe(gulp.dest(config.build))
				.pipe(gulp.dest(`${config.dest}/${pkg.name_space ? pkg.name_space + '_' : ''}${dest}.resource`));
	});
}

function zip() {
	const zip = require('gulp-zip');
	bundle('**/*', (src, dest) => {
		// console.log(src,dest);
		return gulp.src(src)
			.pipe(zip(`${dest}.zip`))
			.pipe(gulp.dest(config.build));
	}, 'resource-bundles');
}

function watch() {
	gulp.watch(config.watch.styles, ['sass']);
	gulp.watch(config.watch.scripts, ['uglify']);
	gulp.watch(config.watch.templates, ['templates']);
	// gulp.watch(config.watch.datapacks, ['datapackTemplates']);
	// NOTE: we could work in live-reload or browser-sync here
}

function onError(err) {
		var notify = require('gulp-notify');
		notify.onError({
			title:'Gulp',
			subtitle: 'Failure!',
			message:'Error: <%= error.message %>'
		})(err);
		console.log(err);
		this.emit('end');
};


function getDirectories(srcpath) {
	var fs = require('fs');
	var path = require('path');

	return fs.readdirSync(srcpath)
	.filter((file) => {
    return fs.statSync(path.join(srcpath, file)).isDirectory();
  });
}

function bundle(src, cb, bundledDir = bundlesDir) {
	var path = require('path');
	var bundles = getDirectories(bundledDir);
	bundles.map(function(bundle) {
		var srcglob = [];

		if (Array.isArray(src)) {
			for (var g of src)	{
				srcglob.push(path.join(bundledDir, bundle, g));
			}
		} else {
			srcglob = path.join(bundledDir, bundle, src);
		}
		cb(srcglob, bundle);
	});
}

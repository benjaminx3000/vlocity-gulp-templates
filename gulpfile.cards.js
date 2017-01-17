var gulp = require('gulp');
var pkg = require('./package.json');

gulp.task('cardTemplates', cardTemplates);
gulp.task('cardJS', cardJS);
gulp.task('cardSass', cardSass);
gulp.task('cardConnect', cardConnect);
gulp.task('cardWatch', cardWatch);
gulp.task('devPrepare', ['cardTemplates'], devPrepare);

gulp.task('cards', ['devPrepare', 'cardJS', 'cardSass', 'cardConnect', 'cardWatch'])

var config = {};
config.frameWorkSrc = 'dev/vlocity_ins__CardFramework.js';
config.datapacks = {};
config.datapacks.expansionPath = 'src/data-packs';
config.datapacks.buildPath = 'build';
config.datapacks.templates = `${config.datapacks.expansionPath}/VlocityUITemplate/**/*.html`;
config.datapacks.javaScripts = `${config.datapacks.expansionPath}/VlocityUITemplate/**/*.js`;
config.datapacks.sass = [
	`${config.datapacks.expansionPath}/VlocityUITemplate/**/*.scss`,
	`!${config.datapacks.expansionPath}/VlocityUITemplate/**/mixin.scss`,
	`!${config.datapacks.expansionPath}/VlocityUITemplate/**/variables.scss`
];

function onCardError(err) {
	var notify = require('gulp-notify');
	notify.onError({
			title:		'Gulp',
			subtitle: 'Failure!',
			message:	'Error: <%= error.message %>'
	})(err);
	console.error(err.message);
	this.emit('end');
};

function cardConnect() {
	var connect = require('gulp-connect');

	connect.server({
		root: './',
		https: true,
		debug: true,
		port: 3001
	})
}

function devPrepare() {
	var concat = require('gulp-concat')

	return gulp.src([`${config.frameWorkSrc}`, 'dev/templateOverride.js', 'build/datapacks.templates.min.js', 'dev/addResources.js'])
		.pipe(concat('framework.js'))
		.pipe(gulp.dest(config.datapacks.buildPath));
}

function cardTemplates() {
	var concat = require('gulp-concat');
	var plumber = require('gulp-plumber');
	var rename = require('gulp-rename');
	var templatecache = require('gulp-angular-templatecache');
	var uglify = require('gulp-uglify');

	return gulp.src(config.datapacks.templates)
		.pipe(plumber({errorHandler: onCardError}))
		.pipe(rename({dirname: 'dev', extname: ''}))
		.pipe(templatecache({standalone: false, module: 'vlocTemplates'}))
		.pipe(concat('datapacks.templates.min.js'))
		.pipe(uglify({mangle: false}))
		.pipe(gulp.dest(config.datapacks.buildPath));
}

function cardSass() {
	// var cssnano = require('gulp-cssnano');
	var plumber = require('gulp-plumber');
	var rename = require('gulp-rename');
	var sass = require('gulp-sass');
	var concat = require('gulp-concat');
	var sourcemaps = require('gulp-sourcemaps');
	var del = require('del');

	del([`${config.datapacks.expansionPath}/VlocityUITemplate/*variables/*.css`,`${config.datapacks.expansionPath}/VlocityUITemplate/*mixin/*.css`]);
	return gulp.src(config.datapacks.sass)
		.pipe(plumber({errorHandler: onCardError}))
		.pipe(sourcemaps.init())
		.pipe(sass({includePaths: [
			`${config.datapacks.expansionPath}/VlocityUITemplate/variables`,
			`${config.datapacks.expansionPath}/VlocityUITemplate/mixin`,
			'bower_components'
		]}))
		.pipe(gulp.dest(`${config.datapacks.expansionPath}/VlocityUITemplate`))
		.pipe(concat('datapacks.min.css'))
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest(config.datapacks.buildPath));
}

function cardJS() {
	var concat = require('gulp-concat');
	var include = require('gulp-include');
	var plumber = require('gulp-plumber');
	var notify = require('gulp-notify');
	var rename = require('gulp-rename');
	var sourcemaps = require('gulp-sourcemaps');

	return gulp.src(config.datapacks.javaScripts)
		.pipe(plumber({errorHandler: onCardError}))
		.pipe(include({
			extensions: 'js',
			includePaths: ['bower_components','./']
		}))
		.pipe(sourcemaps.init())
		.pipe(concat('datapacks.min.js'))
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest(config.datapacks.buildPath))
}


function cardWatch() {
	console.log('watching!!!');
	gulp.watch(config.datapacks.sass, ['cardSass']);
	gulp.watch(config.datapacks.javaScripts, ['cardJS']);
	gulp.watch(config.datapacks.templates, ['devPrepare']);
}
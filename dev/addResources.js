+function() {
    var scripts = document.createElement('script');
    var overrides = document.createElement('script');
    var templates = document.createElement('script');
    var styles = document.createElement('link');

    templates.setAttribute('src', 'https://localhost:3001/build/datapacks.templates.min.js');
    scripts.setAttribute('src', 'https://localhost:3001/build/datapacks.min.js');
    styles.setAttribute('href', 'https://localhost:3001/build/datapacks.min.css');
    styles.setAttribute('rel', 'stylesheet');

    // document.head.appendChild(overrides);
    // document.body.appendChild(templates);
    document.body.appendChild(scripts);
    document.head.appendChild(styles);
}();
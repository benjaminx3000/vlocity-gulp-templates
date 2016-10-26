# Salesforce Gulp Template

This set of gulp tasks watches a 'bundle' of  `.js`, `.scss`, and `.html` files found in a `bundles/bundlename`, and compiles, concatenates, and minifies them respectively into `bundlename.min.js`, `bundlename.min.css`, and `bundlename.templates.min.js`.

Each set of resources is compiled into both a flat `build` directory and `resource-bundles/bundlename.resource` directory. (for use with mavensmate)

The process is also specifically setup to work well with proxly <https://github.com/dnakov/proxly>

Here's an example of setting up proxly to replace all of your namespaced assets.

![Untitled.png](https://bitbucket.org/repo/jMadRa/images/1891131659-Untitled.png)

See [using-proxly.md](using-proxly.md) for more details.

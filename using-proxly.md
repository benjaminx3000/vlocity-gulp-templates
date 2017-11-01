#Local Static Resource Development Using Proxly

 * Download and install the proxly chrome extension and app. You'll find links to both at the provided github link.

 * Over all you'll be able to follow the directions for setting up proxly as normal, however since Salesforce sites are served over https, you'll need to take a few extra steps.

Here's an example config settings for the proxly app.

```
Make sure you have web server selected, and not Local directory

Web Server URL:
https://localhost:8080/ (Or whatever port you've setup)

Match:
https.*/resource/[0-9]+/optional-speciffic-static-resource

Replace with
-- path to your resource --
```

This will match assets you've loaded from a static resource to your local host, provided that the folder name is the same as the static resource name.

* First you'll have to setup an https server at localhost. A good, and easy option is to use grunt-contrib-connect, or gulp-connect.

	In the config options of either task, you'll have to set the protocol to https, for grunt set `option : {protocol: 'https'}`, for gulp pass the option `{https: true}`.

* Now that your local files are being served via https, there's just one more step

	You'll have to enable the chrome flag to allow invalid certificates for resources loaded from localhost

	* Navigate to <chrome://flags/#allow-insecure-localhost>, from there search for https and enable the flag described as **allow invalid certificates for resources loaded from localhost**

* You're ready to rock!
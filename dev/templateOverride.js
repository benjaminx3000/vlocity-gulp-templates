//=require ../build/datapacks.templates.min.js
+function () {
    angular
        .module('vlocTemplates')
        .config(configBlock);

    configBlock.$inject = ['$provide'];
    function configBlock($provide) {
        $provide.decorator('$templateRequest', vsTemplateRequestDecorator)
    }


    // todo overide template cache perhaps in order to restore default functionality.
    vsTemplateRequestDecorator.$inject = ['$delegate', '$templateCache', '$http', '$q'];
    function vsTemplateRequestDecorator($delegate, $templateCache, $http, $q) {
        console.log('yowza', $delegate);
        // vlocTemplateInternalCache.names = [];
        function handleRequestFn(tpl, ignoreRequestError) {
            if (!/.html/.test(tpl)) {
                tpl = 'dev/' + tpl;
                handleRequestFn.totalPendingRequests++;

                var transformResponse = $http.defaults && $http.defaults.transformResponse;

                if (angular.isArray(transformResponse)) {
                    transformResponse = transformResponse.filter(function (transformer) {
                        return transformer !== angular.defaultHttpResponseTransform;
                    });
                } else if (transformResponse === angular.defaultHttpResponseTransform) {
                    transformResponse = null;
                }

                var httpOptions = {
                    cache: $templateCache,
                    transformResponse: transformResponse
                };

                return $http.get(tpl, httpOptions)
                ['finally'](function () {
                    handleRequestFn.totalPendingRequests--;
                })
                    .then(function (response) {
                        return response.data;
                    }, handleError);

                function handleError(resp) {
                    if (!ignoreRequestError) {
                        throw $compileMinErr('tpload', 'Failed to load template: {0}', tpl);
                    }
                    return $q.reject(resp);
                }
            } else {
                return $delegate.apply($delegate, arguments);
            }
        }

        handleRequestFn.totalPendingRequests = 0;

        return handleRequestFn;

    }


} ();
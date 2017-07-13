+function() {
    window.alert = function() {};
    angular 
        .module('vlocity')
        .config(configBlock);

    configBlock.$inject = ['$provide'];
    function configBlock($provide) {
        $provide.decorator('remoteActions', remoteActionsDecorator);
    }


    remoteActionsDecorator.$inject  = ['$delegate','$http', '$q', '$rootScope','nameSpaceService'];
    function remoteActionsDecorator($delegate, $http, $q, $rootScope, nameSpaceService) {
        console.info('Loding cards from local sources', $delegate);
        var $super = {};
        $super.getCardsByNames = $delegate.getCardsByNames;
        $super.getLayout = $delegate.getLayout;
        
        $delegate.getCardsByNames = vsGetCardsByNames;
        // $delegate.getLayout = vsGetLayoutsByName;
        // todo: load cards definitions from local datapack
        function vsGetCardsByNames() {
            let promises = [];
            let cards = arguments[0];
            return nameSpaceService.getNameSpacePrefix()
                .then(
                    function(nsPrefix) {

                        for (let card of cards) {
                            let cardRef = card.replace(/\s/gi, '-');
                            promises.push(
                                $http.get(
                                    `https://localhost:3001/src/data-packs/VlocityCard/${cardRef}/${cardRef}.json`,
                                    {responseType: 'json'}
                                )
                                .then(
                                    function(result) {
                                        return new mockCard(cardRef, result.data, nsPrefix);
                                    }
                                )
                                .catch(
                                    function(reason) {
                                        return reason;
                                    }
                                )
                            )
                        }
                        return $q.all(promises)
                            .then(
                                function(result) {
                                    return result;
                                }
                            )
                            .catch(
                                function(reason) {
                                    console.error(reason);
                                    debugger;
                                    return reason;
                                } 
                            );
                        // return $super.getCardsByNames.apply($delegate, arguments);

                    }
                )
        }

        function vsGetLayoutsByName() {
            let promises = {}
            let layout = arguments[1];
            debugger;
            if (arguments[0] !== 'Name') {
                return $super.getLayout.apply($delegate, arguments);
            } else {

            }

            return $super.getLayout.apply($delegate, arguments);

        }
        return $delegate;
    }

    /*
    function mockLayout(data) {
        if (data.length > 0) {
            var layout = data[0];
            while (typeof layout[nsPrefix + 'Definition__c'] !== 'object' && typeof layout[nsPrefix + 'Definition__c'] !== 'undefined') {//making sure we parse the json
                layout[nsPrefix + 'Definition__c'] = JSON.parse(layout[nsPrefix + 'Definition__c']);
            }
            if (!layout[nsPrefix + 'Definition__c']) {
                layout[nsPrefix + 'Definition__c'] = { templates: [], dataSource: [], Cards: [] };
            }
            layout.templates = layout[nsPrefix + 'Definition__c'].templates;
            layout.dataSource = layout[nsPrefix + 'Definition__c'].dataSource;
            layout.Loaded = false;
            layout.session = {};
            layout.sessionVars = layout[nsPrefix + 'Definition__c'].sessionVars || [];

            var cardNames = layout[nsPrefix + 'Definition__c'] || [];
            if (cardNames.length > 0) {
                return remoteActions.getCardsByNames(cardNames).then(
                    function (data) {

                        var cards = data;
                        layout.Deck = new Array(cards.length);

                        angular.forEach(cards, function (card) {
                            var cardDefinition = { Cards: [] };
                            if (card[nsPrefix + 'Definition__c']) {
                                cardDefinition = JSON.parse(card[nsPrefix + 'Definition__c']);
                            }
                            cardDefinition.layoutName = 'vlocity.layout.' + layout.Name; //need to know the parent name
                            card[nsPrefix + 'Definition__c'] = cardDefinition;
                            var cardIndex = layout[nsPrefix + 'Definition__c'].Cards.indexOf(card.Name);
                            if (cardIndex > -1) {
                                // console and community only use cardDefinition
                                layout.Deck[cardIndex] = cardDefinition;
                            }
                        });

                        layout.Deck = layout.Deck.filter(function (card) {
                            return card !== null;
                        });

                        sessionStorage.setItem('layout::' + layout.Name, JSON.stringify(layout));
                        //layout.Loaded = true;
                        return layout;
                    }, makeErrorHandler('cards retrieval error: '));

            } else {
                layout.Deck = [];
                sessionStorage.setItem('layout::' + layout.Name, JSON.stringify(layout));
                layout.Loaded = true;
                return layout;
            }

        } else {
            //query did not return anything
            return null;
        }
    }
    */

    function mockCard(name, data, nsPrefix) {
        this['Name'] = name;
        this[nsPrefix + 'Definition__c'] = JSON.stringify(data);
    }

}();

+function () {
    console.log('template override loaded');
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


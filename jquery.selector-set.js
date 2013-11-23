(function(window, $) {
  var document = window.document;
  var SelectorSet = window.SelectorSet;
  var originalEventAdd = $.event.add;
  var originalEventRemove = $.event.remove;
  var handleObjs = {};

  $.expr.cacheLength = 500;

  if (!SelectorSet) {
    throw "SelectorSet undefined - https://github.com/josh/jquery-selector-set";
  }

  function selectorSetHandlers(event) {
    var handlerQueue = [],
        cur = event.target,
        set = event.handleObj.selectorSet;

    do {
      var matches = set.matches(cur);
      if (matches.length) {
        handlerQueue.push({elem: cur, handlers: matches});
      }
    } while (cur = cur.parentNode);

    return handlerQueue;
  }

  // Duplicated from $.event.dispatch
  function selectorSetHandler(event) {
    var handlerQueue = selectorSetHandlers(event);
    var matched, i = 0;
    while ((matched = handlerQueue[i++]) && !event.isPropagationStopped()) {
      event.currentTarget = matched.elem;

      var handleObj, j = 0;
      while ((handleObj = matched.handlers[j++]) && !event.isImmediatePropagationStopped()) {
        var ret = handleObj.data.apply(matched.elem, arguments);

        if (ret !== undefined) {
          event.result = ret;
          if (ret === false) {
            event.preventDefault();
            event.stopPropagation();
          }
        }
      }
    }
  }

  $.event.add = function(elem, types, handler, data, selector) {
    if (elem === document && !data && selector) {
      var handleObj = handleObjs[types];
      if (!handleObj) {
        handleObj = handleObjs[types] = {
          handler: selectorSetHandler,
          selectorSet: new SelectorSet()
        };
        originalEventAdd.call(this, elem, types, handleObj);
      }
      $.find.compile(selector);
      handleObj.selectorSet.add(selector, handler);
    } else {
      originalEventAdd.call(this, elem, types, handler, data, selector);
    }
  };

  $.event.remove = function(elem, types, handler, selector, mappedTypes) {
    if (elem === document && selector) {
      var handleObj = handleObjs[types];
      if (handleObj) {
        handleObj.selectorSet.remove(selector, handler);
      }
    } else {
      originalEventRemove.call(this, elem, types, handler, selector, mappedTypes);
    }
  };
})(window, jQuery);

/**
* Flickslider renderer.
* @project UI flicksliders.
* @author Anton Parkhomenko
* @version 1.0
*/
goog.provide('DD.ui.flickSliders.renderer.PanMenu');

goog.require('DD.ui.flickSliders.renderer');
goog.require('DD.ui.renderer.Component');
goog.require('goog.dom.classes');
goog.require('goog.style.transform');

goog.require('goog.fx.AnimationParallelQueue');
goog.require('goog.fx.dom.FadeOutAndHide');
goog.require('goog.fx.dom.FadeInAndShow');

/**
 * Стандартный рендерер компонента PanMenu
 * @constructor
 * @extends DD.ui.renderer.Component
 */
DD.ui.flickSliders.renderer.PanMenu = function()
{
    DD.ui.renderer.Component.call(this);
};
goog.inherits(DD.ui.flickSliders.renderer.PanMenu, DD.ui.renderer.Component);
goog.addSingletonGetter(DD.ui.flickSliders.renderer.PanMenu);

/** @inheritdoc */
DD.ui.flickSliders.renderer.PanMenu.CSS_CLASS = 'DD--panmenu';

goog.scope(function()
{
    /** @alias DD.ui.flickSliders.renderer.PanMenu.prototype */
    var prototype = DD.ui.flickSliders.renderer.PanMenu.prototype;
    var superClass_ = DD.ui.flickSliders.renderer.PanMenu.superClass_;

    /** @inheritdoc */
    prototype.getCssClass = function()
    {
        return DD.ui.flickSliders.renderer.PanMenu.CSS_CLASS;
    };

    /** @inheritdoc */
    prototype.createDom = function(component)
    {
        var element = superClass_.createDom.call(this, component);
        var activeBarCaption = goog.dom.createDom(goog.dom.TagName.DIV, {class: this.getCssClass() + '--active-bar--caption'});
        var activeBar = goog.dom.createDom(goog.dom.TagName.DIV, {class: this.getCssClass() + '--active-bar'}, [activeBarCaption]);

        component.getParams('overlay') && component.$cache('overlay', goog.dom.createDom(goog.dom.TagName.DIV, {class: this.getCssClass() + '--overlay'}));

        component.$cache('activeBarCaption', activeBarCaption);
        component.$cache('activeBar', activeBar);
        component.$cache('element', element);

        return element;
    };

    /** @inheritdoc */
    prototype.initializeDom = function(component)
    {
        superClass_.initializeDom.call(this, component);

        var cache = component.$cache(),
            params = component.getParams(),
            actionTarget = params.actionTarget || cache.root.parentNode;

        cache.mc = new Hammer.Manager(actionTarget);
        var cache = component.$cache();
        cache.parent = cache.root.offsetParent;
        cache.mc = new Hammer.Manager(document.body);
        cache.mc.add(new Hammer.Pan({ direction: Hammer.DIRECTION_VERTICAL, threshold: component.getParams('threshold')}));
        cache.mc.on('pan', this.handlePan_.bind(this, component));
        cache.mc.on('panend', this.handlePanEnd_.bind(this, component));
        
        cache.parent = cache.root.offsetParent;

        if (cache.overlay)
        {
            goog.style.setStyle(cache.overlay,
            {
                display : 'none',
                opacity : 0,
                backgroundColor: component.getParams('overlayColor')
            });
            goog.dom.insertSiblingBefore(cache.overlay, cache.root);
        };
        cache.parent.appendChild(cache.activeBar);

        goog.events.listen(window, goog.events.EventType.RESIZE, this.resizeEvent_, false, component);

        this.update(component);
        component.$cache(cache);
    };
    
    /**
     * Удаление ссылок на DOM-объекты
     * @param  {DD.ui.flickSliders.renderer.PanMenu} component Объект DD.ui.flickSliders.renderer.PanMenu
     */
    prototype.clearDomLinks = function (component)
    {
        var cache = component.$cache();
        goog.dom.removeNode(cache.activeBar);
        cache.overlay && goog.dom.removeNode(cache.overlay);
    };

    /** @inheritdoc */
    prototype.uninitializeDom = function(component)
    {
        superClass_.uninitializeDom.call(this, component);
        var cache = component.$cache();
        cache.mc.destroy();
        goog.events.unlisten(window, goog.events.EventType.RESIZE, this.resizeEvent_, false, component);
    };

    /**
     * Обновление компонента
     * @param  {DD.ui.flickSliders.renderer.PanMenu} component Объект DD.ui.flickSliders.renderer.PanMenu
     */
    prototype.update = function (component)
    {
        var cache = component.$cache();
        this.updateLimits_(component);
        cache.currentSlide ? component.select(cache.currentSlide) : component.select(0);
        component.$cache(cache);
    };

    /**
     * Метод обновления компонента в момент изменения размера окна бразура
     * @param  {Object} event Объект события
     * @private
     */
    prototype.resizeEvent_ = function(event)
    {
        this.resize();
    };

    /**
     * Обновление лимитов и координат элементов компонента
     * @param  {DD.ui.flickSliders.renderer.PanMenu} component Объект DD.ui.flickSliders.renderer.PanMenu
     * @private
     */
    prototype.updateLimits_ = function(component)
    {
        var cache = component.$cache(),
            params = component.getParams(),
            borderBox = goog.style.getBorderBox(params.actionTarget);
            //offset = goog.style.getPageOffset(params.actionTarget);

        cache.element.style.display = 'block';
        cache.activeBar.style.display = 'block';

        cache.activeBarHeight = cache.activeBar.offsetHeight;
        cache.limit =
        {
            top  : params.actionTarget.offsetHeight/2 - cache.activeBarHeight/2 - borderBox.top,
            left : params.actionTarget.offsetWidth/2 - cache.activeBar.offsetWidth/2 - borderBox.left
        };
        cache.x = cache.limit.left;
        /** Если не известна высота меню, нельзя вычесть limit.bottom */
        (cache.element.offsetHeight > 0) && (cache.limit.bottom = cache.limit.top - cache.element.offsetHeight + cache.activeBarHeight);

        this.move_(cache.activeBar, cache.limit.left, cache.limit.top);

        cache.element.style.display = 'none';
        cache.activeBar.style.display = 'none';

        component.$cache(cache);
    };

    /**
     * Метод обновления компонента в момент изменения размера окна бразура
     * @param  {DD.ui.flickSliders.renderer.PanMenu} component Объект DD.ui.flickSliders.renderer.PanMenu
     */
    prototype.resize = function(component)
    {
        var cache = component.$cache();

        clearTimeout(cache.resizeTimer);
        setTimeout(this.updateLimits_.bind(this, component), 300);
    };

    /**
     * Выбор конкретного слайда
     * @param  {DD.ui.flickSliders.renderer.PanMenu}    component Объект DD.ui.flickSliders.renderer.PanMenu
     * @param  {Number=}                                value     Номер слайда по индексу
     * @private
     */
    prototype.select_ = function(component, value)
    {
        var cache = component.$cache();

        if (value instanceof DD.ui.Component)
            index = component.getIndexOf(value);
        else
            index = value;

        cache.y = cache.limit.top - cache.activeBarHeight * index;
        cache.x = cache.limit.left;
        this.move_(cache.element, cache.x, cache.y);
        this.setActiveBarCaptionByIndex_(component, index);
    };

    /**
     * Сдвиг элемента компонента по заданным координатам
     * @param  {HTMLElement} element Ссылка на DOM-объект
     * @param  {Number}      x       Координата по оси Х
     * @param  {Number}      y       Координата по оси Y
     * @private
     */
    prototype.move_ = function(element, x, y)
    {
        goog.style.transform.setTranslation(element, x, y);
    };

    /**
     * Скрытие компонента
     * @param  {DD.ui.flickSliders.renderer.PanMenu}    component Объект DD.ui.flickSliders.renderer.PanMenu
     */
    prototype.hide = function(component)
    {
        var cache = component.$cache(),
            lastSelectedSlide = component.getCurrentSlide(),
            fadeSpeed = component.getParams('fadeSpeed');

        lastSelectedSlide && lastSelectedSlide.setSelected(false);

        if (cache.overlay && cache.isOverlayVisibled)
        {
            cache.overlay.style.opacity = 0;
            setTimeout(function()
            {
                cache.overlay.style.display = 'none';
            }, 100);
            cache.isOverlayVisibled = false;
        };

        cache.fadeout && cache.fadeout.stop();
        cache.fadein && cache.fadein.stop();

        cache.fadeout = new goog.fx.AnimationParallelQueue();
        cache.fadeout.add(new goog.fx.dom.FadeOutAndHide(cache.element, fadeSpeed));
        cache.fadeout.add(new goog.fx.dom.FadeOutAndHide(cache.activeBar, fadeSpeed));
        cache.fadeout.play();

        component.dispatchEvent({type: DD.ui.flickSliders.EventType.SETTLE, index: cache.currentSlideIndex});
        cache.currentSlide.setSelected(true);
        cache.currentSlide.applyActionOnSlide();
    };

    /**
     * Запускается в случае, если было вызвано событие pan от Hammer
     * @param  {DD.ui.Component} component DD.ui.flickSliders.PanMenu
     * @param  {goog.events.EventType} event
     * @private
     */
    prototype.handlePan_ = function(component, event)
    {
        if (component.isDisabled())
            return;

        var cache = component.$cache();

        if (cache.overlay && !cache.isOverlayVisibled)
        {
            cache.overlay.style.display = 'block';
            setTimeout(function()
            {
                cache.overlay.style.opacity = component.getParams('overlayOpacity');    
            }, 0);
            cache.isOverlayVisibled = true;
        };

        /** Вычисляем limit.bottom в случае, если он неизвестен, либо равен 0 */
        if (!cache.limit.bottom)
        {
            cache.element.style.display = 'block';
            cache.limit.bottom = cache.limit.top - cache.element.offsetHeight + cache.activeBarHeight;
            cache.element.style.display = 'none';
        };

        if (!cache.isUpdated)
        {
            var fadeSpeed = component.getParams('fadeSpeed');

            cache.fadein && cache.fadein.stop();
            cache.fadeout && cache.fadeout.stop();

            cache.fadein = new goog.fx.AnimationParallelQueue();
            cache.fadein.add(new goog.fx.dom.FadeInAndShow(cache.element, fadeSpeed));
            cache.fadein.add(new goog.fx.dom.FadeInAndShow(cache.activeBar, fadeSpeed));
            cache.fadein.play();

            cache.isUpdated = true;
        };
        
        if (!cache.firstTouch)
            cache.firstTouch = event.pointers[0].clientY;

        var deltaY = event.pointers[0].clientY - cache.firstTouch;

        (cache.firstTouch = event.pointers[0].clientY);

        var y = deltaY + cache.y;

        if (y > cache.limit.top)
            y = cache.limit.top;
        else if (y < cache.limit.bottom)
            y = cache.limit.bottom;

        cache.y = y;

        this.move_(cache.element, cache.x, y);

        cache.index = parseInt(((cache.limit.top - y) + cache.activeBarHeight/2) / cache.activeBarHeight);

        if (cache.currentSlideIndex != cache.index)
            component.dispatchEvent({type: DD.ui.flickSliders.EventType.CHANGESLIDEINDEX, index: cache.index});

        this.setActiveBarCaptionByIndex_(component, cache.index);

        cache.direction = event.direction;
        component.$cache(cache);

        component.dispatchEvent({type: DD.ui.flickSliders.EventType.DRAGMOVE});
    };

    /**
     * Запускается в случае, если было вызвано событие pan от Hammer
     * @param  {DD.ui.Component} component DD.ui.flickSliders.PanMenu
     * @param  {goog.events.EventType} event
     * @private
     */
    prototype.handlePanEnd_ = function (component, event)
    {
        if (component.isDisabled())
            return;

        var cache = component.$cache();

        cache.isUpdated = false;
        cache.firstTouch = null;
        cache.y = cache.limit.top - cache.activeBarHeight * cache.index;

        component.$cache(cache);

        component.hideByTimer();
        component.dispatchEvent({type: DD.ui.flickSliders.EventType.DRAGEND});
    };

    prototype.setActiveBarCaptionByIndex_ = function (component, index)
    {
        var slide = component.getChildAt(index);
        var cache = component.$cache();
        
        if (!slide)
            return;

        cache.currentSlide && cache.currentSlide.show();
        slide.hide();

        cache.activeBarCaption.textContent = slide.getCaption();
        cache.currentSlide = slide;
        cache.currentSlideIndex = index;

        component.$cache(cache);
    };

}); // goog.scope

/**
 * @overview Flickslider class.
 * @project UI flicksliders.
 * @author Anton Parkhomenko
 * @version 1.0
 */
goog.provide('DD.ui.flickSliders.PanMenu');

goog.require('DD.ui.flickSliders.FlickSlider');
goog.require('DD.ui.flickSliders.renderer.PanMenu');
goog.require('DD.ui.flickSliders.SlidePanMenu');
goog.require('goog.ui.registry');

/**
 * Компонент вертикального меню, появляющегося при взаимподействии указателя по области назначения компонента
 * @constructor
 * @param {Object=} [params] Список входящих параметров
 * @this DD.ui.flickSliders.PanMenu
 * @extends DD.ui.flickSliders.FlickSlider
 * @author Антон Пархоменко
 */
DD.ui.flickSliders.PanMenu = function(params)
{
    DD.ui.flickSliders.FlickSlider.call(this, params);
    var defaults = 
    {
        hideTime        : 300,
        overlay         : false,
        overlayColor    : '#000',
        overlayOpacity  : .3,
        fadeSpeed       : 300,
        /** Область воздействия на компонент, передается DOM-элемент */
        actionTarget        : null
    };
    params = params || {};
    this.params_ = this.assignParams(params, defaults);
    this.slideClass_ = DD.ui.flickSliders.SlidePanMenu;
    this.hideTimer_ = null;
};
goog.inherits(DD.ui.flickSliders.PanMenu, DD.ui.flickSliders.FlickSlider);
goog.ui.registry.setDefaultRenderer(DD.ui.flickSliders.PanMenu, DD.ui.flickSliders.renderer.PanMenu);

goog.scope(function()
{
    /** @alias DD.ui.flickSliders.PanMenu.prototype */
    var prototype = DD.ui.flickSliders.PanMenu.prototype;
    var superClass_ = DD.ui.flickSliders.PanMenu.superClass_;

 	// prototype.setActiveBarCaption = function(value)
  //   {
  //       this.renderer_.setActiveBarCaption(this, value);
  //       this.activeBarCaption_ = value;
  //   };

    /** @inheritdoc */
    prototype.append = function(options)
    {
        return superClass_.append.call(this, this.slideClass_, options);
    };

    /**
     * Убирает из поля зрения по истечении заданного промежутка времени
     */
    prototype.hideByTimer = function()
    {
        var this_ = this;
        clearTimeout(this.hideTimer_);
        this.hideTimer_ = setTimeout(function()
        {
            this_.hide();
        }, this.params_.hideTime);
    }

    /**
     * Метод скрытия компонента
     */
    prototype.hide = function()
    {
        this.renderer_.hide(this);
    };

    /** @inheritdoc */
    prototype.select = function(index)
    {
        superClass_.select.call(this, index);
        this.renderer_.select_(this, index);
    };

    /**
     * Метод обновления компонента в момент изменения размеров окна браузера
     */
    prototype.resize = function()
    {
        this.renderer_.resize(this);
    };

}); // goog.scoope
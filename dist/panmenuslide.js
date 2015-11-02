/**
* Simple slide.
* @project UI flickSliders.
* @author Anton Parkhomenko
* @version 1.0
*/

goog.provide('DD.ui.flickSliders.SlidePanMenu');

goog.require('DD.ui.flickSliders.Slide');
goog.require('DD.ui.flickSliders.renderer.SlidePanMenu');
goog.require('goog.ui.registry');

/**
 * @constructor
 * @extends DD.ui.flickSliders.Slide
 */
DD.ui.flickSliders.SlidePanMenu = function(options, type)
{
    if (!goog.isObject(options))
    {
        var tempOptions = {};
        if (goog.isString(arguments[0]))
            tempOptions.caption = arguments[0];
        if (goog.isFunction(arguments[1]))
            tempOptions.click = arguments[1];
        options = tempOptions;
    };

    DD.ui.flickSliders.Slide.call(this, options);
};
goog.inherits(DD.ui.flickSliders.SlidePanMenu, DD.ui.flickSliders.Slide);
goog.ui.registry.setDefaultRenderer(DD.ui.flickSliders.SlidePanMenu, DD.ui.flickSliders.renderer.SlidePanMenu);

goog.scope(function()
{
    /** @alias DD.ui.flickSliders.SlidePanMenu.prototype */
    var prototype = DD.ui.flickSliders.SlidePanMenu.prototype;
    var superClass_ = DD.ui.flickSliders.SlidePanMenu.superClass_;

    /** inheritdoc */
    prototype.setCaption = function(value)
    {
        this.caption_ = value;
        this.isInDocument() && this.renderer_.setCaption(this);
    };

    /** inheritdoc */
    prototype.getCaption = function()
    {
        return this.caption_;
    };

    /** inheritdoc */
    prototype.hide = function()
    {
        this.element_.style.opacity = 0;
    };

    /** inheritdoc */
    prototype.show = function()
    {
        this.element_.style.opacity = 1;
    };
}); // goog.scope

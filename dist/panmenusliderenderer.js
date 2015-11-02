/**
* Slide renderer.
* @project UI flicksliders.
* @author Anton Parkhomenko
* @version 1.0
*/
goog.provide('DD.ui.flickSliders.renderer.SlidePanMenu');

goog.require('DD.ui.renderer.Component');
/**
 * @constructor
 * @extends DD.ui.renderer.Component
 */
DD.ui.flickSliders.renderer.SlidePanMenu = function()
{
	DD.ui.renderer.Component.call(this);
};
goog.inherits(DD.ui.flickSliders.renderer.SlidePanMenu, DD.ui.renderer.Component);
goog.addSingletonGetter(DD.ui.flickSliders.renderer.SlidePanMenu);

/**
 * @inheritdoc
 */
DD.ui.flickSliders.renderer.SlidePanMenu.CSS_CLASS = 'DD--panmenu--slide';

goog.scope(function()
{
	/** @alias DD.ui.flickSliders.PanMenu.renderer.Slide */
	var prototype = DD.ui.flickSliders.renderer.SlidePanMenu.prototype;
	var superClass_ = DD.ui.flickSliders.renderer.SlidePanMenu.superClass_;


	/**
	 * @inheritdoc
	 */
	prototype.tagName = goog.dom.TagName.DIV;

	/**
	 * @inheritdoc
	 */
	prototype.getCssClass = function()
	{
	  return DD.ui.flickSliders.renderer.SlidePanMenu.CSS_CLASS;
	};

    prototype.createDom = function(component)
    {
        var element = superClass_.createDom.call(this, component);
        var captionElement = goog.dom.createDom(goog.dom.TagName.SPAN,
        {
            class     : DD.ui.flickSliders.renderer.SlidePanMenu.CSS_CLASS + '--caption',
            textContent : component.getCaption()
        });

        component.$cache('captionElement', captionElement);
        element.appendChild(captionElement);

        return element;
    };

    prototype.setCaption = function(component)
    {
        var cache = component.$cache();
    	cache.captionElement.textContent = component.getCaption();
    };
}); // goog.scope

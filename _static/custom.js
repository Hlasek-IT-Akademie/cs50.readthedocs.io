$(function() {

    // Formatieren Sie diese Toctree-Einträge als Literale, da die toctree-Direktive Einträge selbst nicht formatieren kann
    const wrapper = $('<code class="docutils literal notranslate"><span class="pre"></span></code>');
    for (let caption of ['Command-Line Tools', 'Libraries']) {
        let $ul = $('.wy-menu > p > span:contains("' + caption + '")').parent().next('ul');
        for (let text of ['check50', 'compare50', 'cs50', 'lib50']) {
            let $a = $ul.find('> li > a:contains("' + text + '")').wrapInner(wrapper);
        }
    }

});

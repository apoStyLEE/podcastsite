
window.onload = function() {
  podcastApp.init();
}

var podcastApp = {
  podcasts : {},

  init : function() {
    this.loadPodcastData();
    this.helpers.registerHandlebarHelpers();
  },

  loadPodcastData : function () {

    var _this = this;

    $.getJSON( "/data/podcasts.json", function(podcastData) {
        _this.podcasts = podcastData;
        _this.render();
    });
  },

  render : function () {
    this.podcasts.items.reverse();
    var podcasts = this.podcasts;
    var podcastTemplateSource = $("#podcasts-template").html();
    var podcastTemplate = Handlebars.compile(podcastTemplateSource);
    var podcastTemplateHtml = podcastTemplate(podcasts);
    var portfolio = $("#portfolio");    

    portfolio.find(".row-podcasts").html(podcastTemplateHtml);

    portfolio.find(".js-podcast-item").on("click",function () {
        var $this = $(this);
        var index = $this.data("index");
        var id = $this.attr("href").replace("#","");
        var podcastItem = podcasts.items[index];
        var portfolioModal = $(".portfolio-modal#"+id);
        var audioPlayer = portfolioModal.find("audio");
        audioPlayer[0].play();
        location.hash = "#"+id;
    });


    var hash = window.location.hash;
    if (hash != "") {       
        $(".js-podcast-item[href='"+hash+"']").trigger("click");
    };

    $('.portfolio-modal').on('hide.bs.modal', function (e) {
        var audioPlayer = $(this).find("audio");
        audioPlayer[0].pause();
        location.hash = "";
    });

  },

  helpers : {
    //http://stackoverflow.com/questions/37684/how-to-replace-plain-urls-with-links
    linkify : function(inputText) {
      var replacedText, replacePattern1, replacePattern2, replacePattern3;

      //URLs starting with http://, https://, or ftp://
      replacePattern1 = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
      replacedText = inputText.replace(replacePattern1, '<a href="$1" target="_blank">$1</a>');

      //URLs starting with "www." (without // before it, or it'd re-link the ones done above).
      replacePattern2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
      replacedText = replacedText.replace(replacePattern2, '$1<a href="http://$2" target="_blank">$2</a>');

      //Change email addresses to mailto:: links.
      replacePattern3 = /(([a-zA-Z0-9\-\_\.])+@[a-zA-Z\_]+?(\.[a-zA-Z]{2,6})+)/gim;
      replacedText = replacedText.replace(replacePattern3, '<a href="mailto:$1">$1</a>');

      return replacedText;
    },


    registerHandlebarHelpers: function() {
      
      var _this = this;

      Handlebars.registerHelper('formattedText', function(rawText) {
        
        var linkifyText = _this.linkify(rawText);

        linkifyText = linkifyText.replace(/(\r\n|\n|\r)/gm, '<br />');


        return new Handlebars.SafeString(linkifyText);
      });

    }

  }


}
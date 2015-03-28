
window.onload = function() {
  podcastApp.init();
}

var podcastApp = {
  podcasts : {},

  settings : {
    "parseApplicationId" : "hZaugGqe8WWNwvJQXdLMZ6SQCrjwwUcZP5wk9VRK",
    "parseJavaScriptKey" : "BJv2vr3Rm2Y6DwLOJrDzupFkmL0XltechN54UQ2L",
  },

  init : function() {
    this.loadPodcastData();
    this.helpers.registerHandlebarHelpers();
    Parse.initialize(this.settings.parseApplicationId, this.settings.parseJavaScriptKey);
  },

  loadPodcastData : function () {

    var _this = this;

    $.getJSON( "/data/podcasts.json", function(podcastData) {
        _this.podcasts = podcastData;
        _this.render();
    });
  },

  render : function () {

    var _this = this;

    _this.podcasts.items.reverse();
    var podcasts = _this.podcasts;
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
        var audioPlayer = portfolioModal.find("audio")[0];

        audioPlayer.setAttribute("data-id", id);
        
        audioPlayer.play();       

        audioPlayer.onpause = function() {
          _this.stats.add(id, "pause");
        };

        audioPlayer.onplay = function() {
          _this.stats.add(id, "play");
        };

        audioPlayer.onstop = function() {
          _this.stats.add(id, "stop");
        };

        location.hash = "#"+id;

        _this.stats.countQuery(id, "play" , portfolioModal.find(".playCount"));

    });


    var hash = window.location.hash;
    if (hash != "") {       
        $(".js-podcast-item[href='"+hash+"']").trigger("click");
    };

    $('.portfolio-modal').on('hide.bs.modal', function (e) {
        var audioPlayer = $(this).find("audio");
        var podcastId = audioPlayer.attr("data-id");
        audioPlayer[0].pause();
        _this.stats.add(podcastId, "pause");
        location.hash = "";
    });

  },

  stats : {
    
    add : function (podcastid, action) {
      var PodcastCounterObject = Parse.Object.extend("PodcastCounter");
      var podcastCounterObject = new PodcastCounterObject();
      var data = {
          podcastid:podcastid,
          action:action
      };
      podcastCounterObject.save(data);
    },

    countQuery: function(podcastid, action, targetElement) {
      var PodcastCounterObject = Parse.Object.extend("PodcastCounter");
      var query = new Parse.Query(PodcastCounterObject);
      query.equalTo("podcastid", podcastid);
      query.equalTo("action", action);
      
      query.count({
          success: function(count) {           
            targetElement.html(count +" oynatma");
          },
          error: function(error) {
            
          }
      });

    }
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
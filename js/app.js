$(document).ready(function() {

  var peopleScale = 100000;

  var smallTemplateSource  = $("#small-template").html();
  var smallTemplate = Handlebars.compile(smallTemplateSource);
  var popupTemplateSource = $("#popup-template").html();
  var popupTemplate = Handlebars.compile(popupTemplateSource);

  var peopleTemplateSource = $("#people-tile-template").html();
  var peopleTemplate = Handlebars.compile(peopleTemplateSource);


  function initCarIso() {
     var $container = $("#car-iso");
      // init
      $container.isotope({
        // options
        itemSelector: '.small-tile',
        layoutMode: 'fitRows',
        getSortData: {
          category: '[data-category]',
          model: '[data-name]',
          year: '.year',
          problem: '[data-problem]',
          recallDate: '[data-date]',
          population: '.population parseInt'
        },
        sortBy: 'recallDate'
      });


      // store filter for each group
      var filters = {};


      $('#filters').on( 'click', 'li', function(e) {

        var $this = $(this);
        
        // get group key
        var $buttonGroup = $this.parents('#filter-list2');
        $buttonGroup.find(".active").removeClass("active");
        $this.addClass("active");
        var filterGroup = $buttonGroup.attr('data-filter-group');
        // set filter for group
        filters[ filterGroup ] = $this.attr('data-filter');
        var currentFilter = $this.attr('data-filter');
        var currentGroup;
        if (!currentFilter) {
          currentGroup = "total";
        }
        if (currentFilter) {
          currentGroup = currentFilter.substring(1).toLowerCase();
        }
        var $peopleNumber = $("#people-number");
        $peopleNumber.removeClass();
        $peopleNumber.addClass(currentGroup.toUpperCase());
        $peopleNumber.html(numberWithCommas(populationData[currentGroup]));
        console.log(numberWithCommas(populationData[currentGroup]));
        // combine filters
        var filterValue = '';
        for ( var prop in filters ) {
          filterValue += filters[ prop ];
        }
        // set filter for Isotope
        $container.isotope({ filter: filterValue });
        $(".button-group").removeClass("open");
        Analytics.click("Data filtered");
      });

      $('#sorts').on( 'click', 'li', function(e) {
        $("#sorts").find(".active").removeClass("active");
        $(this).addClass("active");
        var sortByValue = $(this).attr('data-sort-by');
        $container.isotope({ sortBy: sortByValue });
        $(".button-group").removeClass("open");
        Analytics.click("Data sorted");
      });
  }

  function initPeopleIso() {
     var $container = $("#people-iso");
      // init
      $container.isotope({
        // options
        itemSelector: '.people-tile',
        layoutMode: 'fitRows',
        getSortData: {
          problem: '[data-problem]',
        }
      });
      $("#people-number").html(numberWithCommas(populationData.total));

      // store filter for each group
      // store filter for each group
      var filters = {};


      $('#filters').on( 'click', 'li', function(e) {

        var $this = $(this);
        
        // get group key
        var $buttonGroup = $this.parents('#filter-list2');
        $buttonGroup.find(".active").removeClass("active");
        $this.addClass("active");
        var filterGroup = $buttonGroup.attr('data-filter-group');
        // set filter for group
        filters[ filterGroup ] = $this.attr('data-filter');
        // combine filters
        var filterValue = '';
        for ( var prop in filters ) {
          filterValue += filters[ prop ];
        }
        // set filter for Isotope
        $container.isotope({ filter: filterValue });
        $(".button-group").removeClass("open");
        Analytics.click("Data filtered");
      });
  }

  function lookupById(id) {
    var result;
    $.each(appData, function(index, value) {
      if (value.appId == id) {
        result = value;
      }
    });
    return result;
  }

  function numberWithCommas(x) {
    if (!x) {
      return "";
    }
    else {
      var parts = x.toString().split(".");
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      return parts.join(".");
    }
  }

  Handlebars.registerHelper("numberWithCommas", function(x) {
      if (!x) {
        return "";
      }
      else {
        var parts = x.toString().split(".");
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return parts.join(".");
      }
      
  });

  var appData = [];
  var populationData = {
      powertrain: 0,
      ignition: 0,
      electrical: 0,
      restraint: 0,
      interior: 0,
      total: 0
    };
   

  $.getJSON("js/gmdata_082714.json", function(data) {
    appData = data;

    $.each(appData, function(index, value) {

    switch (value.problem_category) {
        case "POWERTRAIN":
          value.colorIndex = 0;
          break;
        case "IGNITION":
          value.colorIndex = 1;
          break;
        case "ELECTRICAL":
          value.colorIndex = 2;
          break;
        case "RESTRAINT":
          value.colorIndex = 3;
          break;
        case "INTERIOR":
          value.colorIndex = 4;
          break;
      }
      
      value.appId = "item" + (index + 1);
      var itemMarkup = smallTemplate(value);
      $("#car-iso").append(itemMarkup);
    });

    initCarIso();

    $("#modal-close").on("click", function(){
      $("body").removeClass("modal-active");
      $("#modal-fade").removeClass("fade-in");
    });

    $(".small-tile").on("click", function(e) {
        var id = $(this)[0].id;
        var carData = lookupById(id);
        var popUpContent = popupTemplate(carData);
        $modalContent = $(".modal").find("#modal-content");
        $modalContent.empty();
        $modalContent.removeClass();
        $modalContent.html(popUpContent);
        $modalContent.addClass(carData.problem_category);
        $("body").addClass("modal-active");
        $("#modal-fade").addClass("fade-in");
        Analytics.click("Car details clicked");
      });
    });

  function addPeople(data) {
    $.each(data, function(key, value) {
      var currentColorIndex;
      switch (key) {
        case "powertrain":
          currentColorIndex = 0;
          break;
        case "ignition":
          currentColorIndex = 1;
          break;
        case "electrical":
          currentColorIndex = 2;
          break;
        case "restraint":
          currentColorIndex = 3;
          break;
        case "interior":
          currentColorIndex = 4;
          break;
      }

      if (key != "total") {
        for(i = 0; i <= value; i += peopleScale) {
          var person = {
            problem_category: key.toUpperCase(),
            colorIndex: currentColorIndex
          };    
          var htmlContent = peopleTemplate(person);
          $("#people-iso").append(htmlContent);
        }
      }
      
    });

    initPeopleIso();
  }

  $.getJSON("js/orig_data.json", function(data) {
      $.each(data, function(index, value) {
        populationData.total += value.EXPORTS;

        switch (value.problem_category) {
          case "POWERTRAIN":
            populationData.powertrain += value.EXPORTS;
            break;
          case "IGNITION":
            populationData.ignition += value.EXPORTS;
            break;
          case "ELECTRICAL":
            populationData.electrical += value.EXPORTS;
            break;
          case "RESTRAINT":
            populationData.restraint += value.EXPORTS;
            break;
          case "INTERIOR":
            populationData.interior += value.EXPORTS;
            break;
        }
        
      });
      // console.log(populationData);
      // var populationTemplateSource  = $("#population-template").html();
      // var populationTemplate = Handlebars.compile(populationTemplateSource);
      // var populationHTML = populationTemplate(populationData);
      // $("#population-modal").find("#population-content").html(populationHTML);

      // $("#population-close").on("click", function(){
      //   $("body").removeClass("pop-modal-active");
      //   $("#modal-fade").removeClass("fade-in pop-fade");
      // });



      // $("#population-show").on("click", function(e) {
          
      //     $("body").addClass("pop-modal-active");
      //     $("#modal-fade").addClass("fade-in pop-fade");
      //     Analytics.click("Population data clicked");
      //   });

      addPeople(populationData);
  });

  $("#modal-fade").on("click", function(){
    var $this = $(this);
    if($this.hasClass("pop-fade")) {
      $("body").removeClass("pop-modal-active");
      $("#modal-fade").removeClass("fade-in pop-fade");
    }
    else {
      $("body").removeClass("modal-active");
      $("#modal-fade").removeClass("fade-in");
    }
  });

  function buttonHover() {
    var currentClass;
    $("#filter-list").find("li").on("mouseenter", function(e) {
      var icon = $(this).find("i");
      currentClass = icon.attr("class");
      var newClass = currentClass + "-5";
      icon.removeClass(currentClass);
      icon.addClass(newClass);
    });
    $("#filter-list").find("li").on("mouseleave", function(e) {
      var icon = $(this).find("i");
      icon.removeClass();
      icon.addClass(currentClass);
    });
  }

  buttonHover();

  $(".open-button").on("click", function(e) {
    var thisDropdown = $(this).parent().find(".drop-down");
    var thisParent = $(this).parent();

    if (thisParent.hasClass("open")) {
      thisParent.removeClass("open");
    }
    else {
      $(".button-group").removeClass("open");
       thisParent.addClass("open");
    }
  });

  $(document).click(function(){
    $(".button-group").removeClass("open");
  });

  $(".button-group").on("click", function(e) {
    // console.log("stop at parent");
    // e.stopPropagation();
  });

  $(".toggle-tab").on("click", function(e) {
    $this = $(this);
    var old =  $this.find(".current");
    $this.find(".toggle-item").toggleClass("current");

    if ($this.find(".toggle-item").eq(1).hasClass("current")) {
      hideCars();
    }

    else {
      hidePeople();
    }

  });

  function hideCars() {
    $("#car-iso").hide();
    $("#car-controls").hide();
    $("#people-iso").show();
    $("#people-controls").show();
    $("#people-iso").isotope('layout');
  }

  function hidePeople() {
    $("#people-iso").hide();
    $("#car-iso").show();
    $("#car-controls").show();
    $("#car-iso").isotope('layout');
  }
  
});
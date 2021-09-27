

//var TRAIN_INSTANCES = 15;
//var TEST_SINGLE_INSTANCES = 10;
//var TEST_DOUBLE_INSTANCES = 30;


var condition = _.sample(["random", "random", "yanny_first", "laurel_first"])


function build_trials() {
  var forward_trials = [];
  for (var i = 0; i < clips.length; i++) {
    forward_trials.push({
      "clip": clips[i],
      "stimulus": i - 5
    })
  }
  
  var backward_trials = []
  for (var i = clips.length - 1; i >= 0; i--) {
    backward_trials.push({
      "clip": clips[i],
      "stimulus": i - 5
    })
  }
  
  var trials;
  if (condition == "laurel_first") {
    trials = forward_trials.concat(backward_trials, forward_trials, backward_trials)
  } else if (condition == "yanny_first") {
    trials = backward_trials.concat(forward_trials, backward_trials, forward_trials)
  } else {
    block_1 = _.shuffle(forward_trials)
    block_2 = _.shuffle(forward_trials)
    block_3 = _.shuffle(forward_trials)
    block_4 = _.shuffle(forward_trials)
    trials = block_1.concat(block_2, block_3, block_4)
  }

  return trials;

}



function make_slides(f) {
  var   slides = {};

  slides.i0 = slide({
     name : "i0",
     start: function() {
      exp.startT = Date.now();
     }
  });

  slides.instructions = slide({
    name : "instructions",
    button : function() {
      exp.go(); //use exp.go() if and only if there is no "present" data.
    }
  });

  slides.test_instructions = slide({
    name : "test_instructions",
    button : function() {
      exp.go(); //use exp.go() if and only if there is no "present" data.
    }
  });

  slides.train_trial = slide({
    name: "train_trial",
    present: exp.train_stims,
    present_handle: function(stim) {
      $(".err").hide();
      this.stim = stim;
      $(".display_condition").html("What did you hear?");
      $("#response-1").val("Yanny");
      $("#response-2").val("Laurel");

    //  $(".response-buttons").attr("disabled", "disabled");
      $("#prompt").hide();

      $("#source-wav").attr("src", "./stimuli/" + stim.clip);
      $("#audio-player").load();
      //$("#audio-player").attr("autoplay", "true");




      window.setTimeout(function() {
        $("#audio-player").trigger("play");
      }, 600);

    },
    button : function(response) {
      this.response = response;
      this.log_responses();
      _stream.apply(this);
    },

    log_responses : function() {
      exp.data_trials.push({
        "clip": this.stim.clip,
        "stimulus": this.stim.stimulus,
        "response" : this.response
      });
    }
  });

  


  slides.subj_info =  slide({
    name : "subj_info",
    submit : function(e){
      //if (e.preventDefault) e.preventDefault(); // I don't know what this means.
      exp.subj_data = {
        language : $("#language").val(),
        name : $("#name").val(),
        gender : $('#gender').val(),
        noise_exposure : $('#noise_exposure').val(),
        age : $("#age").val()
      };
      exp.go(); //use exp.go() if and only if there is no "present" data.
    }
  });

  slides.thanks = slide({
    name : "thanks",
    start : function() {
      exp.data= {
          "trials" : exp.data_trials,
          "catch_trials" : exp.catch_trials,
          "system" : exp.system,
          "condition" : exp.condition,
          "subject_information" : exp.subj_data,
          "time_in_minutes" : (Date.now() - exp.startT)/60000
      };
      setTimeout(function() {
        
        $.post(SUBMIT_URL, exp.data)
        
      }, 1000);
    }
  });

  return slides;
}

/// init ///
function init() {
  exp.condition = condition;
  exp.trials = [];
  exp.catch_trials = [];
  exp.train_stims = build_trials(); //can randomize between subject conditions here
  exp.system = {
      Browser : BrowserDetect.browser,
      OS : BrowserDetect.OS,
      screenH: screen.height,
      screenUH: exp.height,
      screenW: screen.width,
      screenUW: exp.width
    };
  //blocks of the experiment:
  exp.structure=["i0",  "train_trial", 'subj_info', 'thanks'];

  exp.data_trials = [];
  //make corresponding slides:
  exp.slides = make_slides(exp);

  exp.nQs = utils.get_exp_length(); //this does not work if there are stacks of stims (but does work for an experiment with this structure)
                    //relies on structure and slides being defined

  $('.slide').hide(); //hide everything

  //make sure turkers have accepted HIT (or you're not in mturk)
  $("#start_button").click(function() {
    exp.go();
  });

  $(".response-buttons, .test-response-buttons").click(function() {
    _s.button($(this).val());
  });

  $("#audio-player").bind("ended", function() {
    $("#prompt").show();
    //$(".response-buttons").attr("disabled", null);
  });


  exp.go(); //show first slide
}

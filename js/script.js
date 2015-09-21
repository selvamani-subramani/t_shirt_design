var tshirts = {};
var t_color = "#CACA00";
var t_font = "sans-serif";
var preview_width = 440;
var preview_height = 280;
var tshirt_logo_position = "tshirt-image-center";
// Top Item select
tshirts.item_select = function() {
  $(".select-design").find("input").not("#add_nos_front").change(function(event) {
    if (!$(this).prop('checked')) {
      $("#text-preview-area").addClass("low-opacity");
      $("#shirt-preview-area .dataImage").remove();
      $("#shirt-preview-area").removeClass("pcenter").removeClass("pleft").removeClass("pright");
      return false;
    } else {
      var klass = $(".shirt-position .position-selected");
      if(klass.hasClass("tshirt-image-left")){
        $("#shirt-preview-area").addClass("pleftl");
      }else if(klass.hasClass("tshirt-image-center")){
        $("#shirt-preview-area").addClass("pcenter");
      }else if(klass.hasClass("tshirt-image-right")){
        $("#shirt-preview-area").addClass("pright");
      }
      $("#text-preview-area").removeClass("low-opacity");
      $("#add_names, #add_logo, #add_decal").not($(this)).prop('checked', false);
    }
    var id = $(this).attr("id");
    master_action(id);
  })

  function set_empyt_box() {
    $(".text-edit, .add-logo, .text-decimal").addClass("hidden");
    $("#text_content").empty();
  }

  function master_action(id) {
    if (id == "add_names") {
      set_empyt_box();
      $("#text_content").append("<span></span>");
      tshirts.enter_text();
      $(".text-edit").removeClass("hidden");
    } else if (id == "add_logo") {
      tshirts.reset_preview_box();
      set_empyt_box();
      $("#text_content").append("<img src='' />")
      $(".add-logo").removeClass("hidden");
      tshirts.change_image();
    } else if (id == "add_decal") {
      tshirts.reset_preview_box();
      set_empyt_box();
      $("#text_content").append("<img src='' />");
      $("#text_content").append("<p class='top-text'></p>").append("<p class='bottom-text'></p>");
      $(".text-decimal").removeClass("hidden");
    }

  }

}

//Option 1 Edit setting
tshirts.change_enter_text = function() {
  $(".preview-property select").on('change', function() {
    if ($(this).hasClass("display-fonts")) {
      t_font = $(this).val();
    }
    tshirts.enter_text();
  })
  $(".text-edit textarea").on('keyup', function() {
    tshirts.enter_text();
  })
  $(".text-edit .color-icons li").on('click', function() {
    t_color = "#" + $(this).text();
    tshirts.enter_text();
  })
}

tshirts.enter_text = function() {

  var t_align = $("#fontp").val();
  var t_spacing = $("#fonti").val();
  $("#text_content span").text("");
  $("#text_content").css({
    "color": t_color,
    "font-family": t_font,
    "padding": t_spacing + "px",
    "width": preview_width - (t_spacing * 2) + "px",
    "height": preview_height - (t_spacing * 2) + "px"
  });

  multi_text = encodeURI($(".text-edit textarea").val()).replace(/%0A/g, "</br>");
  $("#text_content span").html(decodeURI(multi_text)).bigText({
    textAlign: t_align
  });
  tshirts.apply_canvas_to_tshirt();
}

//

//Option 2 Edit setting
tshirts.change_image = function() {
  tshirts.update_image($('#fileupload')[0])
  $('#fileupload').change(function() {
    console.log(this)
    tshirts.update_image(this)
  })
}

tshirts.update_image = function(input) {
  tshirts.reset_preview_box();
  if (input.files && input.files[0]) {
    var reader = new FileReader();

    reader.onload = function(e) {
      $("#text_content img").attr("src", e.target.result);
      tshirts.apply_canvas_to_tshirt();
    }
    reader.readAsDataURL(input.files[0]);
  }
}

//

//Option 3 Edit setting
tshirts.change_image_and_text = function() {
  $(".text-decimal .color-icons li").on('click', function() {
    t_color = "#" + $(this).text();
    tshirts.update_image_and_text();
  })
  $("#decalTextA, #decalTextB").on('keyup', function() {
    tshirts.update_image_and_text();
  })

  $(".text-decimal select").on('change', function() {
    if ($(this).hasClass("display-fonts")) {
      t_font = $(this).val();
    }
    tshirts.update_image_and_text();
  })
}

tshirts.update_image_and_text = function() {

}

//

//Option 4 Select number
tshirts.select_number = function() {

  $("#add_nos_front").click(function() {
    if ($(this).prop('checked')) {
      $(".shirt-position").addClass("add-number");
      $("#shirt-preview-area").addClass("display-number").append("<span>12</span>").find("span").css( "color", t_color );;
    } else {
      $(".shirt-position").removeClass("add-number");
      $("#shirt-preview-area").removeClass("display-number").find("span").remove();
    }
  })
  $(".display-number .big-number, .display-number .small-number").click(function() {
    alert("sd")
  })
}

// 


// Box 3 select logo position over tshirt
tshirts.logo_position_click_event = function() {
  $(".shirt-position .tshirt-image-left").click(function() {
    tshirt_logo_position = "tshirt-image-left"
    tshirts.set_logo_position("left");
  })
  $(".shirt-position .tshirt-image-center").click(function() {
    tshirt_logo_position = "tshirt-image-center"
    tshirts.set_logo_position("center");
  })
  $(".shirt-position .tshirt-image-right").click(function() {
    tshirt_logo_position = "tshirt-image-right"
    tshirts.set_logo_position("right");
  })
}

tshirts.set_logo_position = function(place) {
  $(".shirt-position").find(".position-selected").removeClass("position-selected");
  $(".shirt-position").find("." + tshirt_logo_position).addClass("position-selected");
  $("#shirt-preview-area").removeClass().addClass("p" + place)
}

//

tshirts.apply_canvas_to_tshirt = function() {
  $("#shirt-preview-area .dataImage").remove();
  html2canvas($("#text_content"), {
    onrendered: function(canvas) {
      //$("#shirt-preview-area").append(canvas);
      // var context = canvas.getContext("2d");
      // context.fillStyle = "red";
      imgData = canvas.toDataURL("image/png");
      $("#shirt-preview-area").prepend("<img class='dataImage' src=''>")
      $("#shirt-preview-area img").attr("src", imgData);
      $("#shirt-preview-area").find("span").css( "color", t_color );
    }
  });
}

tshirts.reset_preview_box = function() {
  var i_spacing = 0;
  $("#text_content").css({
    "padding": i_spacing + "px",
    "width": preview_width - (i_spacing * 2) + "px",
    "height": preview_height - (i_spacing * 2) + "px"
  });
}

$("documnet").ready(function() {

  if ($("#add_names").prop('checked')) {
    $(".ext-edit").removeClass("hidden");
    $("#text_content").append("<span></span>");
    tshirts.enter_text();
  } else if ($("#add_logo").prop('checked')) {
    $(".add-logo").removeClass("hidden");
    $("#text_content").append("<img src='' />");
  } else if ($("#add_decal").prop('checked')) {
    $(".text-decimal").removeClass("hidden");
    $("#text_content").append("<img src='' />").append("<p class='top-text'></p>").append("<p class='bottom-text'></p>");
  }

  tshirts.item_select();
  tshirts.enter_text();
  tshirts.change_enter_text();
  tshirts.logo_position_click_event();
  tshirts.change_image_and_text();
  tshirts.select_number();


})
